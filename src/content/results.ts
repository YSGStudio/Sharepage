/**
 * 연구 결과 및 검증 요약 정적 콘텐츠 (R5).
 *
 * 주의: 아래 수치는 중간보고서 기준의 **중간 성과**이며, 최종 결과는
 * 결과분석 단계(2026.12~2027.1) 이후 갱신한다. 학생 개인을 식별할 수 있는
 * 정보는 담지 않는다.
 */

export const RESULTS_NOTICE =
  "아래 내용은 중간보고서 기준의 중간 성과입니다. 최종 검증 결과는 결과분석 단계를 마친 뒤 갱신됩니다.";

export interface TaskResult {
  id: string;
  kind: "공통과제" | "선택과제";
  title: string;
  outcomes: string[];
  evidence: string[];
  implication: string;
}

export const TASK_RESULTS: TaskResult[] = [
  {
    id: "common-1",
    kind: "공통과제",
    title: "BRIDGE 모델 개발 및 적용",
    outcomes: [
      "6단계 절차와 단계별 교사 발문·학생 활동 표준안을 개발해 전 학년에 배포",
      "학년군별 적용 지도안을 축적해 교과·주제별 사례집 형태로 정리",
      "수업 나눔을 통해 단계별 운영 시간 배분과 발문 예시를 지속 보완",
    ],
    evidence: [
      "전 학년 교과 수업에 BRIDGE 단계를 적용한 지도안 축적",
      "수업 나눔의 날 참관 교사 협의록",
      "교사 대상 중간 설문에서 모델 이해도·적용 자신감 향상 응답",
    ],
    implication:
      "단계를 매 차시 모두 채우려 할 때 시간 부담이 컸다. 단원 단위로 여섯 단계를 배분하는 설계가 현장에 더 맞는다는 점을 확인했다.",
  },
  {
    id: "common-2",
    kind: "공통과제",
    title: "학생 주도성 신장",
    outcomes: [
      "선택·책임·학생 목소리·협력 요소를 지도안에 명시하도록 서식 개선",
      "자기평가·상호평가 도구를 개발해 Evaluate & Grow 단계에 정착",
      "학급을 넘어선 나눔(Give & Share) 활동이 학교 단위 행사로 확대",
    ],
    evidence: [
      "학생 대상 사전·사후 설문에서 학습 참여 태도 문항 응답 변화",
      "학생 자기평가 기록 누적 자료",
      "학생 산출물 전시 및 아카이브 게시물",
    ],
    implication:
      "학생이 선택할 수 있는 폭을 넓힐수록 참여가 올라갔지만, 저학년은 선택지를 좁혀 제시해야 실행이 가능했다.",
  },
  {
    id: "common-3",
    kind: "공통과제",
    title: "교원 전문성 신장 및 일반화",
    outcomes: [
      "교내 자율연수와 동료 장학을 정례화해 AI·디지털 도구 활용 역량 향상",
      "BRIDGE 뉴스 발간과 BRIDGE 아카이브 운영으로 자료 공유 체계 마련",
      "강남서초 수업나눔, 싱가폴 대사 방문 수업나눔 등 대외 공개 사례 축적",
    ],
    evidence: [
      "교내 연수 운영 실적 및 참여 교사 만족도",
      "BRIDGE 뉴스 발간 호수와 아카이브 등록 자료 수",
      "외부 공개 수업 참관 인원과 참관 소감",
    ],
    implication:
      "축적된 자료를 외부가 찾아볼 창구가 없다는 점이 확산의 병목이었다. 이 성과공유 웹사이트 구축이 후속 과제로 도출되었다.",
  },
  {
    id: "option-1",
    kind: "선택과제",
    title: "기초학력 보장",
    outcomes: [
      "학기 초·중 진단으로 지원이 필요한 학생을 조기에 파악",
      "담임과 협력 강사가 연계한 개별 보충 지도 운영",
      "AI 디지털 교과서 학습 이력을 활용한 맞춤 과제 제공",
    ],
    evidence: [
      "기초학력 진단 도구 사전·사후 결과 비교",
      "개별 지원 대상 학생의 학습 이력 변화",
    ],
    implication:
      "진단–지도–재진단 주기를 학기 단위로 고정하니 지원의 연속성이 생겼다. 도구가 준 데이터보다 교사의 해석이 결정적이었다.",
  },
  {
    id: "option-2",
    kind: "선택과제",
    title: "생태전환교육 연계",
    outcomes: [
      "학년별 생태전환 프로젝트 주제를 개발해 BRIDGE 단계에 결합",
      "학생이 지역 문제를 직접 정의하고 실천 캠페인으로 연결",
      "디지털 도구로 자료를 수집·시각화하는 활동 경험 축적",
    ],
    evidence: [
      "학년별 프로젝트 산출물과 캠페인 실행 기록",
      "학생 성찰 기록에 나타난 실천 의지 변화",
    ],
    implication:
      "탐구(I)–제작(D)–나눔(G) 흐름이 생태전환 주제와 잘 맞았다. 다만 실천이 일회성 캠페인에 그치지 않도록 후속 활동 설계가 필요하다.",
  },
];

export interface DisseminationCase {
  title: string;
  description: string;
}

export const DISSEMINATION_CASES: DisseminationCase[] = [
  {
    title: "BRIDGE 뉴스 발간",
    description:
      "연구 진행 상황과 수업 사례를 정기적으로 정리해 교직원·학부모와 공유했다.",
  },
  {
    title: "BRIDGE 아카이브 운영",
    description:
      "학년별 지도안과 학생 산출물을 한곳에 모아 교사들이 서로의 수업을 참고할 수 있게 했다.",
  },
  {
    title: "강남서초 수업나눔",
    description:
      "인근 학교 교사들을 대상으로 BRIDGE 적용 수업을 공개하고 협의회를 운영했다.",
  },
  {
    title: "싱가폴 대사 방문 수업나눔",
    description:
      "해외 방문단을 대상으로 AI·디지털 기반 수업을 공개하며 모델을 소개했다.",
  },
];

export interface VerificationPlanItem {
  target: string;
  method: string;
  timing: string;
}

export const VERIFICATION_PLAN: VerificationPlanItem[] = [
  {
    target: "학생",
    method: "학습 참여 태도·주도성 설문, 기초학력 진단, 산출물 분석",
    timing: "사전(3월) · 사후(12월)",
  },
  {
    target: "교사",
    method: "모델 이해도·적용 자신감 설문, 수업 나눔 협의록 분석",
    timing: "사전(3월) · 중간(7월) · 사후(12월)",
  },
  {
    target: "학부모",
    method: "연구학교 운영 인식 및 자녀 변화에 대한 설문",
    timing: "사전(3월) · 사후(12월)",
  },
];
