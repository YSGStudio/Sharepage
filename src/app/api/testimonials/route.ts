import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AUTHOR_TYPES, type AuthorType } from "@/lib/supabase/types";

const MAX_CONTENT_LENGTH = 2000;
const MAX_NAME_LENGTH = 40;
const MAX_GRADE = 6;
const MAX_CLASS = 9;

/** "1"~max 사이의 정수 문자열이면 숫자로, 아니면 null. */
function parseRange(value: unknown, max: number): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
}

/**
 * 소감 제출 (R12, R13).
 * 로그인 없이 누구나 제출할 수 있고, 항상 status='pending' 으로 저장된다.
 * 클라이언트가 status 를 보내도 무시한다 — 승인은 운영자만 할 수 있다.
 */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const body = (raw ?? {}) as Record<string, unknown>;
  const content =
    typeof body.content === "string" ? body.content.trim() : "";
  let authorName =
    typeof body.authorName === "string" ? body.authorName.trim() : "";
  const authorType = String(body.authorType ?? "");

  if (!content) {
    return NextResponse.json(
      { error: "소감 내용을 입력해 주세요." },
      { status: 400 },
    );
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `소감은 ${MAX_CONTENT_LENGTH}자 이내로 써 주세요.` },
      { status: 400 },
    );
  }
  if (authorName.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: "이름이 너무 깁니다." },
      { status: 400 },
    );
  }
  if (!AUTHOR_TYPES.includes(authorType as AuthorType)) {
    return NextResponse.json(
      { error: "작성자 구분(학생/학부모/교사)을 선택해 주세요." },
      { status: 400 },
    );
  }

  // 학부모는 이름 대신 자녀의 학년·반만 받는다.
  if (authorType === "parent") {
    const grade = parseRange(body.grade, MAX_GRADE);
    const classNo = parseRange(body.classNo, MAX_CLASS);
    if (grade === null || classNo === null) {
      return NextResponse.json(
        { error: "자녀의 학년(1~6)과 반(1~9)을 선택해 주세요." },
        { status: 400 },
      );
    }
    authorName = `${grade}학년 ${classNo}반 학부모`;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("testimonials").insert({
    author_type: authorType,
    author_name: authorName || null, // 비우면 익명
    content,
    status: "pending", // 항상 대기. 즉시 공개되지 않는다 (R13).
    reviewed_by: null,
  });

  if (error) {
    console.error("[testimonials] 저장 실패:", error.message);
    return NextResponse.json(
      { error: "소감 등록에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        "소감을 보내 주셔서 감사합니다. 확인 후 공개됩니다.",
    },
    { status: 201 },
  );
}
