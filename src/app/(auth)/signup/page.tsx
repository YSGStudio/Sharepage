import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, Container, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "교사 가입 신청",
  description: "연구학교 교사 계정 가입을 신청합니다. 운영자 승인 후 활동할 수 있습니다.",
};

export default async function SignupPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/teacher");

  return (
    <>
      <PageHeader
        eyebrow="교사 전용"
        title="교사 가입 신청"
        description="가입 신청 후 운영자 승인을 받으면 수업자료·사진 업로드와 지도안 저장 기능을 쓸 수 있습니다."
      />
      <Container className="max-w-md">
        <div className="mb-6">
          <Alert tone="info" title="승인 절차 안내">
            가입 직후 계정은 <strong>승인 대기</strong> 상태입니다. 로그인은
            되지만 교사 전용 기능은 운영자가 승인한 뒤에 사용할 수 있습니다.
          </Alert>
        </div>

        <SignupForm />

        <p className="mt-6 text-sm text-ink-500">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            로그인하기
          </Link>
        </p>
      </Container>
    </>
  );
}
