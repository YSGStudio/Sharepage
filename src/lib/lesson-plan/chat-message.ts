import type { LessonPlanInput } from "./schema";

/**
 * 채팅 지도안 메시지 처리 (브라우저·서버 공용, 순수 함수).
 *
 * 모델은 지도안을 다 쓴 답변의 맨 끝에만
 * `<!-- lesson-plan-input {...} -->` 주석을 붙인다 (chat-prompt.ts).
 * 화면은 이 주석으로 "완성된 지도안"을 알아보고, 주석은 떼어 낸 뒤 보여 주고 내려받게 한다.
 * 주석 속 값은 저장(/api/lesson-plan/save)에 그대로 넘긴다.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** 대화 길이 상한. 한 지도안을 만들고 몇 번 고치기에 충분한 양이다. */
export const MAX_MESSAGES = 30;
export const MAX_USER_CHARS = 4000;
/** 지도안 전체가 담긴 답변도 들어와야 하므로 넉넉하게 둔다. */
export const MAX_ASSISTANT_CHARS = 20000;
/** 한 번에 고를 수 있는 성취기준 수 (통합 수업 대비) */
export const MAX_STANDARDS = 5;

const METADATA_PATTERN = /<!--\s*lesson-plan-input\s*([\s\S]*?)\s*-->/;

export interface SplitPlan {
  /** 주석을 뗀 본문 */
  body: string;
  /** 완성된 지도안이면 저장용 입력값, 아니면 null */
  input: LessonPlanInput | null;
}

/** 지도안을 다 쓴 답변인지 (주석이 깨졌어도 완성본으로 본다) */
export function isCompletedPlan(content: string): boolean {
  return METADATA_PATTERN.test(content);
}

export function splitPlanMetadata(content: string): SplitPlan {
  const match = content.match(METADATA_PATTERN);
  if (!match) return { body: content.trim(), input: null };

  const body = content.replace(METADATA_PATTERN, "").trim();
  try {
    const parsed = JSON.parse(match[1]) as unknown;
    if (!parsed || typeof parsed !== "object") return { body, input: null };
    const input = {} as Record<string, string>;
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") input[key] = value;
    }
    return { body, input: input as unknown as LessonPlanInput };
  } catch {
    // 주석이 깨졌어도 본문은 지도안이다. 저장만 못 할 뿐 보여 주고 내려받을 수는 있다.
    return { body, input: null };
  }
}

export type ChatValidation =
  | { ok: true; messages: ChatMessage[]; standardCodes: string[] }
  | { ok: false; message: string };

/** 채팅 요청 본문을 검증한다. 마지막 메시지는 교사의 말이어야 한다. */
export function validateChatRequest(raw: unknown): ChatValidation {
  const body = (raw ?? {}) as Record<string, unknown>;
  const list = body.messages;

  if (!Array.isArray(list) || list.length === 0) {
    return { ok: false, message: "보낼 메시지가 없습니다." };
  }
  if (list.length > MAX_MESSAGES) {
    return {
      ok: false,
      message: `대화가 너무 길어졌습니다(최대 ${MAX_MESSAGES}개). '새 대화'로 다시 시작해 주세요.`,
    };
  }

  const messages: ChatMessage[] = [];
  for (const item of list) {
    const m = (item ?? {}) as Record<string, unknown>;
    const role = m.role;
    const content = typeof m.content === "string" ? m.content.trim() : "";
    if ((role !== "user" && role !== "assistant") || !content) {
      return { ok: false, message: "메시지 형식이 올바르지 않습니다." };
    }
    const max = role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (content.length > max) {
      return {
        ok: false,
        message: `메시지가 너무 깁니다. ${max.toLocaleString()}자 이내로 줄여 주세요.`,
      };
    }
    messages.push({ role, content });
  }

  if (messages[messages.length - 1].role !== "user") {
    return { ok: false, message: "마지막 메시지는 선생님의 메시지여야 합니다." };
  }

  const standardCodes = Array.isArray(body.standardCodes)
    ? body.standardCodes
        .filter((c): c is string => typeof c === "string")
        .slice(0, MAX_STANDARDS)
    : [];

  return { ok: true, messages, standardCodes };
}
