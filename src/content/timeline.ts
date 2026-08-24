/**
 * 월별 추진 타임라인 정적 콘텐츠 (R4).
 * 연구 기간이 3월 시작이므로 준비 단계인 2월부터 이듬해 1월까지 12개월을 담는다.
 */

export type PhaseName = "계획" | "실행" | "결과분석" | "일반화";

export interface TimelineMonth {
  month: string;
  yearLabel: string;
  phase: PhaseName;
  headline: string;
  activities: string[];
}

export const TIMELINE: TimelineMonth[] = [
  {
    month: "2월",
    yearLabel: "2026",
    phase: "계획",
    headline: "연구 준비와 조직 구성",
    activities: [
      "연구학교 운영 계획 수립 및 교직원 협의",
      "5개 분과 조직 구성과 역할 분담",
      "연구 관련 기초 자료 조사",
    ],
  },
  {
    month: "3월",
    yearLabel: "2026",
    phase: "계획",
    headline: "실태 조사와 모델 초안 확정",
    activities: [
      "학생·교사·학부모 실태 조사(사전 검사) 실시",
      "BRIDGE 6단계 모델 초안 확정",
      "연구학교 운영 설명회 및 학부모 안내",
      "디지털 기기·환경 점검",
    ],
  },
  {
    month: "4월",
    yearLabel: "2026",
    phase: "실행",
    headline: "전 학년 수업 적용 시작",
    activities: [
      "학년별 BRIDGE 적용 수업 시작",
      "교내 자율연수 1차 (모델 이해와 단계별 설계)",
      "학년군별 지도안 개발 착수",
    ],
  },
  {
    month: "5월",
    yearLabel: "2026",
    phase: "실행",
    headline: "동료 장학과 자료 축적",
    activities: [
      "동료 장학 및 수업 나눔 1차",
      "학생 산출물 아카이브 구축",
      "BRIDGE 뉴스 창간호 발간",
    ],
  },
  {
    month: "6월",
    yearLabel: "2026",
    phase: "실행",
    headline: "선택과제 연계 운영",
    activities: [
      "기초학력 진단 및 맞춤 지원 시작",
      "생태전환교육 연계 프로젝트 1차 운영",
      "학기 중간 학생 주도성 점검",
    ],
  },
  {
    month: "7월",
    yearLabel: "2026",
    phase: "실행",
    headline: "1학기 정리와 중간 점검",
    activities: [
      "1학기 운영 결과 분과별 정리",
      "교사 대상 중간 설문 및 모델 수정 협의",
      "여름 방학 중 2학기 운영 계획 보완",
    ],
  },
  {
    month: "8월",
    yearLabel: "2026",
    phase: "실행",
    headline: "2학기 준비 연수",
    activities: [
      "교내 자율연수 2차 (AI·디지털 도구 심화)",
      "수정된 BRIDGE 표준안 공유",
      "2학기 수업 나눔 일정 확정",
    ],
  },
  {
    month: "9월",
    yearLabel: "2026",
    phase: "실행",
    headline: "2학기 수업 적용 확대",
    activities: [
      "전 학년 2학기 BRIDGE 수업 적용",
      "학년별 프로젝트 학습 본격 운영",
      "학생 자기평가 도구 적용 확대",
    ],
  },
  {
    month: "10월",
    yearLabel: "2026",
    phase: "실행",
    headline: "공개 수업과 대외 나눔",
    activities: [
      "연구학교 공개 수업(수업 나눔의 날) 운영",
      "인근 학교 및 교육지원청 대상 수업 나눔",
      "학부모 공개 수업 및 의견 수렴",
    ],
  },
  {
    month: "11월",
    yearLabel: "2026",
    phase: "실행",
    headline: "실행 마무리와 성과 정리",
    activities: [
      "학년별 프로젝트 결과 발표회",
      "학생 산출물 전시 및 아카이브 정리",
      "분과별 실행 결과 보고",
    ],
  },
  {
    month: "12월",
    yearLabel: "2026",
    phase: "결과분석",
    headline: "검증 실시",
    activities: [
      "학생·교사·학부모 사후 검사 실시",
      "사전·사후 결과 비교 분석",
      "기초학력 도달도 분석",
    ],
  },
  {
    month: "1월",
    yearLabel: "2027",
    phase: "일반화",
    headline: "보고와 확산",
    activities: [
      "연구 결과 보고서 작성 및 발간",
      "BRIDGE 수업 자료집 제작·배포",
      "연구 결과 보고회 운영 및 성과 확산",
    ],
  },
];

export const PHASE_DESCRIPTIONS: Record<PhaseName, string> = {
  계획: "연구 과제를 확정하고 조직·일정·모델 초안을 세우는 단계",
  실행: "전 학년 수업에 적용하며 자료를 쌓고 모델을 다듬는 단계",
  결과분석: "사전·사후 비교로 연구의 효과를 확인하는 단계",
  일반화: "성과를 정리해 학교 밖으로 확산하는 단계",
};
