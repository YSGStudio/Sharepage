import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin, isApprovedTeacher, type CurrentUser } from "@/lib/auth";

/**
 * API 라우트용 권한 가드 (R16, R17, R22).
 *
 * 실패하면 NextResponse 를 돌려주고, 성공하면 user 를 돌려준다.
 * 라우트 핸들러는 `if ("response" in result) return result.response;` 형태로 쓴다.
 *
 * RLS 가 마지막 방어선이지만, API 단에서도 같은 판정을 해야
 * 사용자에게 알아볼 수 있는 오류 메시지를 줄 수 있다.
 */
export type GuardResult =
  | { user: CurrentUser }
  | { response: NextResponse };

function deny(status: number, message: string): { response: NextResponse } {
  return {
    response: NextResponse.json({ error: message }, { status }),
  };
}

/** 로그인만 요구한다. */
export async function requireUser(): Promise<GuardResult> {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return deny(401, "로그인이 필요합니다.");
  return { user };
}

/** 승인 완료된 교사만 통과. 승인 대기 계정은 403 (R22). */
export async function requireApprovedTeacher(): Promise<GuardResult> {
  const result = await requireUser();
  if ("response" in result) return result;

  const { user } = result;
  if (!user.teacher) {
    return deny(403, "교사 프로필이 없습니다. 운영자에게 문의해 주세요.");
  }
  if (user.teacher.status === "rejected") {
    return deny(403, "가입이 거부된 계정입니다.");
  }
  if (!isApprovedTeacher(user)) {
    return deny(
      403,
      "승인 대기 중인 계정입니다. 운영자 승인 후 이용할 수 있습니다.",
    );
  }
  return { user };
}

/** 운영자만 통과 (R16, R17). */
export async function requireAdmin(): Promise<GuardResult> {
  const result = await requireApprovedTeacher();
  if ("response" in result) return result;

  if (!isAdmin(result.user)) {
    return deny(403, "운영자 권한이 필요합니다.");
  }
  return result;
}
