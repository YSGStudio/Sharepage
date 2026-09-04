import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, Container, PageHeader } from "@/components/ui";
import { getCurrentUser, isApprovedTeacher } from "@/lib/auth";
import { NewsUploadForm } from "./upload-form";

export const metadata: Metadata = { title: "브릿지 뉴스 올리기" };

export default async function NewsUploadPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");

  const approved = isApprovedTeacher(user);

  return (
    <>
      <PageHeader
        eyebrow="교사 전용"
        title="브릿지 뉴스 올리기"
        description="PDF 를 올리면 첫 페이지가 목록 표지로 자동 등록됩니다. 학생 개인정보가 담기지 않았는지 확인해 주세요."
      />
      <Container className="max-w-2xl">
        {!approved ? (
          <Alert tone="warning" title="아직 승인 대기 중입니다">
            운영자가 가입을 승인한 뒤에 소식지를 올릴 수 있습니다.
          </Alert>
        ) : (
          <NewsUploadForm />
        )}
      </Container>
    </>
  );
}
