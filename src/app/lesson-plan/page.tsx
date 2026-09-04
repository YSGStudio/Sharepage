import type { Metadata } from "next";
import { Alert, Container, PageHeader } from "@/components/ui";
import { getCurrentUser, isApprovedTeacher } from "@/lib/auth";
import { DAILY_LIMIT } from "@/lib/lesson-plan/rate-limit";
import { LessonPlanGenerator } from "./generator";

export const metadata: Metadata = {
  title: "BRIDGE 지도안 만들기",
  description:
    "학년·교과·성취기준 등을 입력하면 수업 나눔 양식 그대로 1쪽 개요면과 2쪽 전개면을 갖춘 BRIDGE 교수·학습과정안 초안을 만들어 드립니다. 로그인 없이 바로 쓰고 내려받을 수 있습니다.",
};

export default async function LessonPlanPage() {
  // 로그인한 승인 교사에게만 "저장" 버튼을 노출한다 (R11).
  const user = await getCurrentUser().catch(() => null);
  const canSave = isApprovedTeacher(user);

  return (
    <>
      <PageHeader
        eyebrow="도구"
        title="BRIDGE 지도안 만들기"
        description="필수 항목을 입력하면 BR(문제 발견·인식)·ID(해결방법 탐색·문제해결)·GE(공유·성찰) 3단계로 1쪽 개요면과 2쪽 전개면이 만들어집니다. 로그인하지 않아도 만들고 내려받을 수 있습니다."
      />

      <Container>
        <div className="mb-8">
          <Alert tone="warning" title="반드시 읽어 주세요">
            여기서 만들어지는 지도안은 <strong>AI가 생성한 초안</strong>입니다.
            교사의 검수와 수정을 거치지 않은 상태로 수업에 그대로 사용하지
            마세요. 성취기준·평가기준은 입력하신 내용을 그대로 반영하도록
            설계했지만, 생성 결과는 항상 직접 확인하셔야 합니다.
          </Alert>
        </div>

        <LessonPlanGenerator canSave={canSave} dailyLimit={DAILY_LIMIT} />
      </Container>
    </>
  );
}
