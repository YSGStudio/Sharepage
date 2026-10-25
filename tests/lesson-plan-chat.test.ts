import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_MESSAGES,
  splitPlanMetadata,
  validateChatRequest,
} from "@/lib/lesson-plan/chat-message";
import {
  buildChatSystemPrompt,
  collectStandards,
} from "@/lib/lesson-plan/chat-prompt";
import {
  extractStandardCodes,
  findStandard,
  STANDARDS,
} from "@/lib/lesson-plan/standards";

/**
 * 채팅 지도안: 성취기준 자료, 요청 검증, 완성 표시 주석, 시스템 프롬프트, 라우트.
 */

describe("성취기준 자료", () => {
  it("3~6학년 성취기준 511개를 해설·성취수준과 함께 싣는다", () => {
    expect(STANDARDS).toHaveLength(511);
    const s = findStandard("[4국01-03]");
    expect(s?.standard).toContain("준언어");
    expect(s?.explanation).toContain("이 성취기준은");
    expect(s?.levelHigh).toBeTruthy();
    expect(s?.levelLow).toBeTruthy();
  });

  it("학년군은 3~4, 5~6 두 가지뿐이다 (원본의 3~5·3~6·3~7 오기를 바로잡음)", () => {
    expect(new Set(STANDARDS.map((s) => s.gradeBand))).toEqual(
      new Set(["3~4", "5~6"]),
    );
    expect(findStandard("[4과03-02]")?.gradeBand).toBe("3~4");
  });

  it("대괄호가 없어도 코드로 찾는다", () => {
    expect(findStandard("6수01-01")?.code).toBe("[6수01-01]");
  });

  it("글 속의 코드를 중복 없이 뽑는다", () => {
    expect(
      extractStandardCodes("[4과05-01]과 4과05-01, 그리고 6사02-03 로 해 주세요"),
    ).toEqual(["[4과05-01]", "[6사02-03]"]);
  });
});

describe("splitPlanMetadata", () => {
  const input = {
    grade: "4학년",
    semester: "1학기",
    subject: "과학",
    unit: "2단원",
    period: "3/6차시",
    achievementStandard: "[4과05-01] …",
    goal: "분류할 수 있다.",
    task: "분류하기",
    evalCriteriaTop: "정확히 분류한다.",
  };

  it("주석이 있으면 떼어 내고 입력값을 돌려준다", () => {
    const content = `## 1쪽\n본문\n<!-- lesson-plan-input ${JSON.stringify(input)} -->`;
    const { body, input: parsed } = splitPlanMetadata(content);
    expect(body).toBe("## 1쪽\n본문");
    expect(parsed).toEqual(input);
  });

  it("질문만 한 답변은 지도안이 아니다", () => {
    expect(splitPlanMetadata("① 학습목표를 알려 주세요.").input).toBeNull();
  });

  it("주석 JSON 이 깨져도 본문은 남긴다", () => {
    const { body, input: parsed } = splitPlanMetadata(
      "본문\n<!-- lesson-plan-input {grade: -->",
    );
    expect(body).toBe("본문");
    expect(parsed).toBeNull();
  });
});

describe("validateChatRequest", () => {
  it("마지막 메시지가 교사 메시지인 대화를 받는다", () => {
    const result = validateChatRequest({
      messages: [{ role: "user", content: " 4학년 과학 " }],
      standardCodes: ["[4과05-01]", 3],
    });
    expect(result).toEqual({
      ok: true,
      messages: [{ role: "user", content: "4학년 과학" }],
      standardCodes: ["[4과05-01]"],
    });
  });

  it.each([
    ["빈 대화", { messages: [] }],
    ["잘못된 역할", { messages: [{ role: "system", content: "x" }] }],
    ["빈 내용", { messages: [{ role: "user", content: "  " }] }],
    [
      "답변으로 끝나는 대화",
      {
        messages: [
          { role: "user", content: "a" },
          { role: "assistant", content: "b" },
        ],
      },
    ],
    [
      "너무 긴 대화",
      {
        messages: Array.from({ length: MAX_MESSAGES + 1 }, () => ({
          role: "user",
          content: "a",
        })),
      },
    ],
    ["너무 긴 메시지", { messages: [{ role: "user", content: "가".repeat(4001) }] }],
  ])("%s 는 거부한다", (_, body) => {
    expect(validateChatRequest(body).ok).toBe(false);
  });
});

describe("채팅 시스템 프롬프트", () => {
  it("고른 코드와 메시지에 적힌 코드의 자료를 함께 찾는다", () => {
    const found = collectStandards(
      [{ role: "user", content: "6수01-01 도 같이요" }],
      ["[4과05-01]", "[9국01-01]"],
    );
    expect(found.map((s) => s.code)).toEqual(["[4과05-01]", "[6수01-01]"]);
  });

  it("성취기준 해설과 성취수준 상·중·하를 싣는다", () => {
    const standard = findStandard("[4국01-03]")!;
    const prompt = buildChatSystemPrompt([standard]);
    expect(prompt).toContain(standard.standard);
    expect(prompt).toContain(standard.explanation);
    expect(prompt).toContain(`성취수준 상: ${standard.levelHigh}`);
    expect(prompt).toContain(`성취수준 하: ${standard.levelLow}`);
  });

  it("elementary-lesson-plan 스킬 문서를 그대로 싣는다", () => {
    const prompt = buildChatSystemPrompt([]);
    expect(prompt).toContain("절대 6단계");
    expect(prompt).toContain("해결방법 탐색·문제해결");
    expect(prompt).toContain("분량 기준표");
    expect(prompt).toContain("실시간피드백");
    expect(prompt).not.toContain("name: elementary-lesson-plan");
  });

  it("모자란 필수 입력은 한 번에 묻고, 완성본에만 주석을 붙이게 한다", () => {
    const prompt = buildChatSystemPrompt([]);
    expect(prompt).toContain("모자란 항목만 번호 목록으로 한 번에");
    expect(prompt).toContain("<!-- lesson-plan-input");
    expect(prompt).toContain("질문만 하는 답변에는 이 주석을 붙이지 않습니다");
  });
});

// ── 라우트 ──

const generateChatReply = vi.fn();
const readSitePlanCount = vi.fn();
const recordSitePlan = vi.fn();

vi.mock("@/lib/lesson-plan/generate", () => ({ generateChatReply }));
vi.mock("@/lib/lesson-plan/rate-limit", () => ({
  readSitePlanCount,
  recordSitePlan,
}));

const { POST } = await import("@/app/api/lesson-plan/chat/route");

function post(body: unknown) {
  return new Request("http://localhost/api/lesson-plan/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  generateChatReply.mockReset();
  generateChatReply.mockResolvedValue("① 학습목표를 알려 주세요.");
  readSitePlanCount.mockReset();
  readSitePlanCount.mockResolvedValue({ allowed: true, count: 1, limit: 5 });
  recordSitePlan.mockReset();
  recordSitePlan.mockResolvedValue({ allowed: true, count: 2, limit: 5 });
});

describe("POST /api/lesson-plan/chat", () => {
  it("고른 성취기준 자료를 시스템 프롬프트에 붙여 답변한다", async () => {
    const res = await POST(
      post({
        messages: [{ role: "user", content: "4학년 1학기 과학이에요" }],
        standardCodes: ["[4과05-01]"],
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).content).toContain("학습목표");

    const [system, messages] = generateChatReply.mock.calls[0];
    expect(system).toContain(findStandard("[4과05-01]")!.standard);
    expect(messages).toEqual([{ role: "user", content: "4학년 1학기 과학이에요" }]);
    // 질문만 한 답변은 지도안 수에 들어가지 않는다.
    expect(recordSitePlan).not.toHaveBeenCalled();
  });

  it("잘못된 요청은 400이고 제한 횟수도, 모델도 쓰지 않는다", async () => {
    const res = await POST(post({ messages: [] }));
    expect(res.status).toBe(400);
    expect(readSitePlanCount).not.toHaveBeenCalled();
    expect(generateChatReply).not.toHaveBeenCalled();
  });

  it("완성된 지도안이 나오면 홈페이지 전체 카운터를 올린다", async () => {
    generateChatReply.mockResolvedValue("# 지도안\n<!-- lesson-plan-input {} -->");
    const res = await POST(post({ messages: [{ role: "user", content: "a" }] }));
    expect(res.status).toBe(200);
    expect(recordSitePlan).toHaveBeenCalledTimes(1);
    expect((await res.json()).usage).toEqual({ count: 2, limit: 5 });
  });

  it("이미 완성본이 있는 대화에서 고친 지도안은 다시 세지 않는다", async () => {
    generateChatReply.mockResolvedValue("# 고친 지도안\n<!-- lesson-plan-input {} -->");
    const res = await POST(
      post({
        messages: [
          { role: "user", content: "a" },
          { role: "assistant", content: "# 지도안\n<!-- lesson-plan-input {} -->" },
          { role: "user", content: "활동 2를 바꿔 주세요" },
        ],
      }),
    );
    expect(res.status).toBe(200);
    expect(recordSitePlan).not.toHaveBeenCalled();
  });

  it("오늘 지도안 5개가 다 차면 새 대화는 429", async () => {
    readSitePlanCount.mockResolvedValue({ allowed: false, count: 5, limit: 5 });
    const res = await POST(post({ messages: [{ role: "user", content: "a" }] }));
    expect(res.status).toBe(429);
    expect(generateChatReply).not.toHaveBeenCalled();
  });

  it("다 찼어도 이미 완성본이 있는 대화는 계속 고칠 수 있다", async () => {
    readSitePlanCount.mockResolvedValue({ allowed: false, count: 5, limit: 5 });
    const res = await POST(
      post({
        messages: [
          { role: "user", content: "a" },
          { role: "assistant", content: "# 지도안\n<!-- lesson-plan-input {} -->" },
          { role: "user", content: "고쳐 주세요" },
        ],
      }),
    );
    expect(res.status).toBe(200);
  });

  it("모델 호출이 실패하면 502", async () => {
    generateChatReply.mockRejectedValue(new Error("boom"));
    const res = await POST(post({ messages: [{ role: "user", content: "a" }] }));
    expect(res.status).toBe(502);
  });
});
