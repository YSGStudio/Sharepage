/**
 * 연구 운영 조직(교원별 역할) 정적 콘텐츠 (R3).
 *
 * 담당자 표기는 공개 사이트임을 고려해 계획서최종본과 동일하게 **이니셜**로 둔다.
 * 학교 측에서 실명 공개를 확정하면 이 파일의 `members` 값만 바꾸면 된다.
 * (context-notes.md "미확인/추가 확인 필요" 참고)
 */

export const NAME_DISCLOSURE_POLICY = "initials" as const;

export interface Division {
  id: string;
  name: string;
  mission: string;
  duties: string[];
  members: string[];
}

export const DIVISIONS: Division[] = [
  {
    id: "planning",
    name: "연구·기획 분과",
    mission: "연구의 방향을 세우고 전체 일정을 관리한다.",
    duties: [
      "연구 계획서·중간보고서·최종보고서 작성 총괄",
      "연구 과제 및 BRIDGE 모델 설계 방향 결정",
      "월별 추진 일정 관리와 분과 간 조율",
      "연구 예산 편성 및 집행 계획 수립",
    ],
    members: ["김○○ (연구부장)", "최○○"],
  },
  {
    id: "curriculum",
    name: "교육과정개발 분과",
    mission: "BRIDGE 모델을 교육과정과 수업에 실제로 녹여 낸다.",
    duties: [
      "BRIDGE 6단계 수업 모델 및 단계별 표준안 개발",
      "학년군별 교과 적용 지도안 개발과 검토",
      "AI·디지털 도구의 단계별 활용 지침 마련",
      "선택과제(기초학력·생태전환) 연계 프로그램 설계",
    ],
    members: ["양○○", "이○○"],
  },
  {
    id: "operation",
    name: "연구운영팀",
    mission: "수업 적용과 학교 단위 활동이 굴러가게 한다.",
    duties: [
      "학년별 수업 적용 및 수업 나눔의 날 운영",
      "학생 활동 자료·산출물 수집과 아카이브 관리",
      "공개 수업 및 외부 방문 일정 운영",
      "학생 주도성 신장 활동(학생 자치·나눔) 지원",
    ],
    members: ["박○○", "정○○"],
  },
  {
    id: "evaluation",
    name: "지원관리 및 평가 분과",
    mission: "연구가 실제로 효과가 있었는지 확인한다.",
    duties: [
      "학생·교사·학부모 대상 사전·사후 검사 설계와 실시",
      "기초학력 진단 및 결과 분석",
      "연구 결과 통계 처리와 검증 보고서 작성",
      "연구 물품·환경 지원 및 디지털 기기 관리",
    ],
    members: ["한○○", "조○○"],
  },
  {
    id: "outreach",
    name: "홍보·연수 분과",
    mission: "안에서는 배우게 하고, 밖으로는 알린다.",
    duties: [
      "교내 자율연수·동료 장학 기획과 운영",
      "BRIDGE 뉴스 발간 및 학교 홈페이지·성과공유 사이트 운영",
      "학부모 대상 안내와 연구 참여 소통",
      "타 학교·교육청 대상 성과 확산 자료 제작",
    ],
    members: ["윤○○", "서○○"],
  },
];

export interface SupportBody {
  name: string;
  role: string;
}

export const SUPPORT_BODIES: SupportBody[] = [
  {
    name: "학교장·교감",
    role: "연구 방향 승인, 대외 협력, 연구 여건 조성",
  },
  {
    name: "연구운영위원회",
    role: "분과별 진행 상황 점검, 주요 의사결정, 월 1회 정례 협의",
  },
  {
    name: "외부 자문위원",
    role: "모델 타당성 검토, 검증 도구 자문, 성과 일반화 방향 자문",
  },
];
