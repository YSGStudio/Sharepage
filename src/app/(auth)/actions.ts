"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
  success?: string;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  revalidatePath("/", "layout");
  redirect("/teacher");
}

/**
 * 회원가입 (R21, R22).
 * teachers 행은 DB 트리거(handle_new_user)가 role='teacher', status='pending' 으로
 * 강제 생성한다. 클라이언트가 role/status 를 지정할 방법은 없다.
 */
export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const passwordConfirm = readString(formData, "passwordConfirm");
  const name = readString(formData, "name");
  const division = readString(formData, "division");

  if (!email || !password || !name) {
    return { error: "이름, 이메일, 비밀번호는 모두 필수입니다." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 서로 일치하지 않습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, division } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "이미 가입된 이메일입니다. 로그인해 주세요." };
    }
    return { error: `가입에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/", "layout");

  // 이메일 확인이 켜져 있으면 세션 없이 사용자만 만들어진다.
  if (data.session) {
    redirect("/teacher");
  }

  return {
    success:
      "가입 신청이 접수되었습니다. 확인 메일이 발송되었다면 메일의 링크를 눌러 인증한 뒤, 운영자 승인을 기다려 주세요.",
  };
}
