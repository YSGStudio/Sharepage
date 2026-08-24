import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, Container, PageHeader } from "@/components/ui";
import { getCurrentUser, isApprovedTeacher } from "@/lib/auth";
import { MaterialUploadForm } from "./upload-form";

export const metadata: Metadata = { title: "수업자료 올리기" };

export default async function MaterialUploadPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");

  const approved = isApprovedTeacher(user);

  return (
    <>
      <PageHeader
        eyebrow="교사 전용"
        title="수업자료 올리기"
        description="올린 자료는 승인 절차 없이 바로 공개됩니다. 학생 개인정보가 담기지 않았는지 확인해 주세요."
      />
      <Container className="max-w-2xl">
        {!approved ? (
          <Alert tone="warning" title="아직 승인 대기 중입니다">
            운영자가 가입을 승인한 뒤에 자료를 올릴 수 있습니다.
          </Alert>
        ) : (
          <MaterialUploadForm />
        )}
      </Container>
    </>
  );
}
