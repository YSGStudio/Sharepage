/**
 * 연구 핵심소개 정적 콘텐츠 (R1).
 * DB 테이블을 두지 않고 코드에 포함해 빌드 시점에 확정한다 (PRD Non-Goals).
 * 출처: 2026 언남 연구학교 계획서최종본.
 */

export const RESEARCH_OVERVIEW = {
  school: "서울언남초등학교",
  area: "교육방법",
  subject:
    "AI·디지털 기반 교육자료 등을 활용한 교수·학습 혁신 및 학생 역량 강화 지원방안",
  period: "2026. 3. 1. ~ 2027. 2. 28. (1년)",
  model: "BRIDGE 교수·학습 모델",
  summary:
    "AI·디지털 도구를 수업의 목적이 아닌 도구로 자리매김하고, 학생이 스스로 묻고 탐구하고 만들어 나누는 수업으로 학교 전체의 교수·학습을 전환한다.",
} as const;

export interface ResearchTask {
  id: string;
  kind: "공통과제" | "선택과제";
  title: string;
  description: string;
  strategies: string[];
}

export const RESEARCH_TASKS: ResearchTask[] = [
  {
    id: "common-1",
    kind: "공통과제",
    title: "AI·디지털 기반 교수·학습 모델(BRIDGE) 개발 및 적용",
    description:
      "문제해결모형과 프로젝트학습법을 통합해 학교 단위에서 공통으로 쓸 수 있는 6단계 수업 모델을 개발하고, 전 학년 교과 수업에 적용한다.",
    strategies: [
      "BRIDGE 6단계 절차와 단계별 교사 발문·학생 활동 표준안 개발",
      "학년군별 적용 사례 축적 및 수업 나눔을 통한 모델 정교화",
      "AI·디지털 도구를 각 단계의 목적에 맞게 배치하는 도구 활용 지침 마련",
    ],
  },
  {
    id: "common-2",
    kind: "공통과제",
    title: "학생 주도성 신장을 위한 수업 문화 조성",
    description:
      "선택·책임·학생 목소리·협력의 네 가지 요소를 수업 설계에 명시적으로 넣어, 학생이 학습의 주체가 되는 경험을 반복적으로 제공한다.",
    strategies: [
      "학생 선택권을 보장하는 과제·산출물 형태 다양화",
      "학생 자기평가·상호평가 도구 개발 및 정례화",
      "학급·학년 단위 학습 나눔(Give&Share) 활동 정착",
    ],
  },
  {
    id: "common-3",
    kind: "공통과제",
    title: "교원 전문성 신장 및 성과 일반화",
    description:
      "교내 연수와 수업 나눔으로 교사의 AI·디지털 활용 역량을 높이고, 개발한 모델과 자료를 타 학교와 교육청으로 확산한다.",
    strategies: [
      "분과별 교내 연수 및 동료 장학 운영",
      "BRIDGE 뉴스 발간과 아카이브 운영으로 자료 축적",
      "수업 나눔의 날, 외부 공개 수업으로 성과 확산",
    ],
  },
  {
    id: "option-1",
    kind: "선택과제",
    title: "기초학력 보장을 위한 맞춤형 지원",
    description:
      "AI 디지털 교과서와 진단 도구로 학생별 학습 상태를 파악하고, 도달이 늦은 학생에게 개별화된 보충 학습 기회를 제공한다.",
    strategies: [
      "학기 초·중·말 3회 진단으로 학습 상태 추적",
      "기초학력 협력 강사와 담임의 연계 지도",
      "학생별 학습 이력 기반 맞춤 과제 제공",
    ],
  },
  {
    id: "option-2",
    kind: "선택과제",
    title: "생태전환교육과의 연계",
    description:
      "BRIDGE 모델의 탐구·제작·나눔 단계를 생태전환 주제와 결합해, 학생이 지역 사회 문제를 스스로 정의하고 실천으로 잇도록 한다.",
    strategies: [
      "학년별 생태전환 프로젝트 주제 개발",
      "디지털 도구를 활용한 자료 수집·시각화 활동",
      "학교·가정·지역이 함께하는 실천 캠페인 운영",
    ],
  },
];

export interface ResearchPhase {
  order: number;
  name: string;
  period: string;
  focus: string;
}

/** 연구 절차 4단계 */
export const RESEARCH_PHASES: ResearchPhase[] = [
  {
    order: 1,
    name: "계획",
    period: "2026. 2. ~ 2026. 3.",
    focus:
      "연구 과제 확정, 조직 구성, 실태 조사, BRIDGE 모델 초안 설계 및 연간 운영 계획 수립",
  },
  {
    order: 2,
    name: "실행",
    period: "2026. 4. ~ 2026. 11.",
    focus:
      "전 학년 수업 적용, 교내 연수와 수업 나눔, 자료 축적, 중간 점검을 통한 모델 수정",
  },
  {
    order: 3,
    name: "결과분석",
    period: "2026. 12. ~ 2027. 1.",
    focus:
      "학생·교사·학부모 대상 검증, 사전·사후 비교 분석, 과제별 성과와 한계 정리",
  },
  {
    order: 4,
    name: "일반화",
    period: "2027. 1. ~ 2027. 2.",
    focus: "보고서 발간, 자료집 배포, 공개 보고회 운영, 타 학교·교육청 확산",
  },
];

/** 내비게이션·페이지에서 쓰는 과제 번호 이름 (과제1~3, 선택1~2) */
export function taskLabel(task: ResearchTask): string {
  const sameKind = RESEARCH_TASKS.filter((t) => t.kind === task.kind);
  const order = sameKind.indexOf(task) + 1;
  return task.kind === "공통과제" ? `과제${order}` : `선택${order}`;
}
