import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, Container, PageHeader } from "@/components/ui";
import { getCurrentUser, isApprovedTeacher } from "@/lib/auth";
import { PhotoUploadForm } from "./upload-form";

export const metadata: Metadata = { title: "사진 올리기" };

export default async function PhotoUploadPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");

  const approved = isApprovedTeacher(user);

  return (
    <>
      <PageHeader
        eyebrow="교사 전용"
        title="운영 사진 올리기"
        description="올린 사진은 바로 갤러리에 공개됩니다."
      />
      <Container className="max-w-2xl">
        <div className="mb-6">
          <Alert tone="warning" title="개인정보 확인">
            학생 얼굴이 식별되는 사진은 보호자 동의를 받은 경우에만 올려 주세요.
            이름표·명단 등 개인정보가 함께 찍히지 않았는지 확인해 주세요.
          </Alert>
        </div>

        {!approved ? (
          <Alert tone="warning" title="아직 승인 대기 중입니다">
            운영자가 가입을 승인한 뒤에 사진을 올릴 수 있습니다.
          </Alert>
        ) : (
          <PhotoUploadForm />
        )}
      </Container>
    </>
  );
}
