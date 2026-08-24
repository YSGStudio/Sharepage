import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "교사 로그인",
  description: "연구학교 교사 계정으로 로그인합니다.",
};

export default async function LoginPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/teacher");

  return (
    <>
      <PageHeader
        eyebrow="교사 전용"
        title="교사 로그인"
        description="수업자료·사진 업로드와 지도안 저장은 승인된 교사 계정으로만 가능합니다."
      />
      <Container className="max-w-md">
        <LoginForm />
        <p className="mt-6 text-sm text-ink-500">
          아직 계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            가입 신청하기
          </Link>
        </p>
      </Container>
    </>
  );
}
