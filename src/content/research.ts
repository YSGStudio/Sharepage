/**
 * 연구 핵심소개 정적 콘텐츠 (R1).
 * DB 테이블을 두지 않고 코드에 포함해 빌드 시점에 확정한다 (PRD Non-Goals).
 * 출처: 2026학년도 서울특별시교육청 연구학교 운영 중간보고서(v4 제출용).
 */

export const RESEARCH_OVERVIEW = {
  school: "서울언남초등학교",
  area: "교육방법",
  subject:
    "AI·디지털 기반 교육자료 등을 활용한 교수·학습 혁신 및 학생 역량 강화 지원방안",
  period: "2026. 3. 1. ~ 2027. 2. 28. (1년)",
  target: "1~6학년 34학급 712명",
  model: "AI·디지털 기반 BRIDGE 프로젝트",
  slogan: "BRIDGE 프로젝트로 연결하는 배움과 성장의 교육 혁신",
  summary:
    "2022 개정 교육과정의 방향을 반영해 AI·디지털 기반 BRIDGE 수업 모델을 개발·적용하고, 학생·교사·학교가 함께 성장하는 지속 가능한 미래형 수업 운영 체제를 구축한다.",
} as const;

/** 연구의 목적 (중간보고서 Ⅰ-2) */
export const RESEARCH_PURPOSES: string[] = [
  "BRIDGE 프로젝트 운영을 위한 환경 및 기반을 조성한다.",
  "BRIDGE 수업 모델을 적용하여 수업 혁신, 교사 전문성 강화, 학생 성장 지원이 유기적으로 연결되는 교수·학습 전환 모델을 설계·운영한다.",
  "BRIDGE 프로젝트의 운영 결과를 평가하고 일반화한다.",
];

/** 종합 목표 (중간보고서 Ⅰ-4 연구과제 개요) */
export const RESEARCH_GOAL =
  "AI·디지털 기반 수업 혁신, 학생의 디지털 역량 및 리터러시 신장, 교사의 전문성 강화와 협력적 연구 생태계 구축, 기초학력 보장과 맞춤형 학습 지원, 생태전환교육 모델 및 실천 환경 조성을 통해 학생 맞춤형 교육을 통한 미래교육을 실현한다.";

export interface TaskFigure {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

export interface TaskExecutionItem {
  title: string;
  /** 단계 순서가 있는 항목이면 true (흐름도로 표시) */
  flow?: boolean;
  /** 해당 항목에서 실제로 운영한 활동 */
  details?: string[];
  /** 기본 사진 (결과보고서에서 가져옴). 운영자가 바꾸면 task_item_photos 의 사진이 대신 보인다. */
  photo?: string;
}

export interface TaskExecution {
  title: string;
  items: TaskExecutionItem[];
}

export interface ResearchTask {
  id: string;
  kind: "공통과제" | "선택과제";
  /** 중간보고서 연구과제 개요의 과제명 */
  title: string;
  /** 핵심 목표 */
  goal: string;
  description: string;
  /** 주요 추진 내용 */
  strategies: string[];
  /** 실행 내용 (결과보고서 Ⅳ. 연구 과제의 실행 목차) */
  executions?: TaskExecution[];
  /** 과제 설명 이미지 (표시 순서대로) */
  figures?: TaskFigure[];
}

export const RESEARCH_TASKS: ResearchTask[] = [
  {
    id: "common-1",
    kind: "공통과제",
    title: "AI·디지털 기반 교수·학습·평가 일체형 수업모델 개발 및 검증",
    goal: "AI·디지털 기술을 활용한 교수·학습·평가 일체형 수업 체제 구축",
    description:
      "교사·학생 상호작용이 부족한 교실을, AI·디지털 기술로 교수·평가 선택지가 많은 수업으로 바꾼다. 문제 발견·인식 → 해결방법 탐색·문제해결 → 공유·성찰의 흐름을 갖춘 BRIDGE 수업 모델을 개발해 학년·교과로 확장 적용한다.",
    strategies: [
      "AI·디지털 기반 교수·학습·평가 일체형 수업 모델 개발: BRIDGE 6단계(Buzz–Recognize–Inquire–Develop–Grow–Enrich)의 단계별 흐름과 교사 역할, AI·디지털 교육도구 적용 방안 마련",
      "AI·디지털 기반 학습 과정 중심 평가 혁신: 학생 참여형 과정 중심 평가, AI 기반 학습 분석, 맞춤형 성장 지원의 3단계 평가 순환 구축",
      "개발된 수업 모델의 학년·교과 확장 적용 및 고도화 운영: 수업 모델 설계 협의 → 수업 모델 컨설팅 → 모델 적용 컨설팅 → 교직원 연수(확산)",
    ],
    executions: [
      {
        title: "AI·디지털 기반 교육혁신을 위한 교수·학습·평가 일체형 수업 모델 개발",
        items: [
          {
            title: "BRIDGE 수업 모델 단계별 흐름",
            photo: "/images/tasks/common-1-1-1.jpg",
          },
          {
            title: "교·수·평 일체화를 위한 수업 개요",
            photo: "/images/tasks/common-1-1-2.jpg",
          },
          {
            title: "BRIDGE 단계별 수업 전략 및 AI·디지털 도구 활용의 타당성",
            photo: "/images/tasks/common-1-1-3.jpg",
          },
          {
            title: "학생 주도성 향상을 위한 4가지 전략",
            photo: "/images/tasks/common-1-1-4.jpg",
          },
        ],
      },
      {
        title: "AI·디지털 기반 학습 과정 중심 평가 혁신",
        items: [
          {
            title: "AI·디지털 기반 과정 중심 평가의 순서",
            flow: true,
            details: ["학생 참여형 과정 중심 평가", "AI 기반 학습 분석", "맞춤형 성장 지원"],
          },
          {
            title: "AI·디지털 기반 과정 중심 평가의 사례",
            photo: "/images/tasks/common-1-2-2.jpg",
            details: [
              "학습의 과정 전체를 볼 수 있는 포트폴리오 수집(와우아이디어스 활용)",
              "AI·디지털 기반 실시간 피드백",
            ],
          },
        ],
      },
      {
        title: "개발된 수업 모델의 학년·교과 확장 적용 및 고도화 운영",
        items: [
          {
            title: "BRIDGE 모델 고도화를 위한 과정",
            photo: "/images/tasks/common-1-3-1.jpg",
            flow: true,
            details: ["수업 모델 설계 협의", "수업 모델 컨설팅", "모델 적용 컨설팅", "교직원 연수(확산)"],
          },
          { title: "학년·교과별 수업 모델의 적용" },
        ],
      },
    ],
  },
  {
    id: "common-2",
    kind: "공통과제",
    title: "학생 주도적인 디지털 역량 및 리터러시 신장",
    goal: "학생의 디지털 활용 능력과 책임 있는 디지털 시민성 함양",
    description:
      "수업에 소극적인 학생, 디지털에 과몰입하는 학생, AI를 단순 도구로만 쓰는 학생이, 디지털 친화적으로 수업에 주도적으로 참여하고 책임감 있게 기술을 사용하며 AI와 협력해 메타 창의성을 발휘하는 학생으로 성장하도록 돕는다.",
    strategies: [
      "‘디지털 또래 지원단’을 통한 디지털 기초 소양 강화: 또래 지원단 활동과 학년별 동아리 연계 디지털 팝업 클래스 운영",
      "AI·디지털 윤리 교육을 통한 올바른 디지털 정체성 함양: 학년별 맞춤 디지털 시민성 교육과 모두가 함께하는 디지털 캠페인 운영",
      "디지털 포트폴리오 누적 및 성장 확산 활동 운영: 학생 성장 기록의 체계화, 학교 안 성장 공유 플랫폼과 학급·학년별 성장 전시회 운영",
    ],
    executions: [
      {
        title: "‘디지털 또래 지원단’을 통한 디지털 캠페인",
        items: [
          {
            title: "또래 지원단 활동",
            photo: "/images/tasks/common-2-1-1.jpg",
          },
          {
            title: "학년별 동아리 활동 연계한 디지털 팝업 클래스 운영",
            photo: "/images/tasks/common-2-1-2.jpg",
            details: [
              "AI·디지털 리터러시 향상을 위한 팝업 클래스 운영",
              "AI 윤리가이드 정하기(학급 → 자치회 가이드 정리)",
            ],
          },
        ],
      },
      {
        title: "AI·디지털 윤리 교육을 통한 올바른 디지털 정체성 함양",
        items: [
          {
            title: "3학년: 우리 생활 속 AI와 디지털 정보 만나기",
            photo: "/images/tasks/common-2-2-1.jpg",
          },
          {
            title: "4학년: 가짜 정보를 찾아라",
            photo: "/images/tasks/common-2-2-2.jpg",
          },
          {
            title: "5학년: AI 리터러시 박람회",
            photo: "/images/tasks/common-2-2-3.jpg",
          },
          {
            title: "6학년: AI 시대의 시민으로서 나의 역할 찾기",
            photo: "/images/tasks/common-2-2-4.jpg",
          },
        ],
      },
      {
        title: "디지털 포트폴리오 누적 및 성장 확산 활동 운영",
        items: [
          {
            title: "디지털 포트폴리오를 통한 학생 성장 기록 및 가정 소통 강화",
            photo: "/images/tasks/common-2-3-1.jpg",
            details: ["디지털 도구를 활용한 성장 과정 기록", "성장 플랫폼 운영을 통한 기록의 체계화"],
          },
          {
            title: "학교 문화를 변화시키는 성장 확산 활동 운영",
            photo: "/images/tasks/common-2-3-2.jpg",
            details: [
              "학교 안 안전한 SNS 운영(성장 공유 플랫폼 Toast + Star)",
              "학급 및 학년별 성장 전시회",
              "가족이 함께 하는 바이브코딩 체험연수",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "common-3",
    kind: "공통과제",
    title: "오케스트레이션 역량 강화 – 협력적 연구 생태계 구축",
    goal: "교사의 AI·디지털 수업 전문성 및 협력 문화 조성",
    description:
      "AI·디지털 기반 교육자료 사용이 힘든 교사, 수업 나눔을 학교 행사로만 여기는 문화, 기존 방식을 고수하는 학교를 인공지능을 스마트 조교로 활용하는 교사, 수업 나눔이 일상화되는 연구 문화, 학교 단위의 디지털 전환을 시도하는 학교로 전환한다.",
    strategies: [
      "맞춤형·브릿지형 연수를 통한 교원의 디지털 역량 강화: 공동성찰·공동연구·공동나눔 교원학습공동체와 ‘우리학교 연수원’ 운영",
      "수업 나눔을 통한 연구 내용 확산 및 공유: BRIDGE 뉴스 발간, 강남서초·해외 방문단 대상 수업 나눔, BRIDGE 아카이브를 통한 교육과정 재구성 사례 공유",
      "연구 문화 조성을 위한 업무 경감 체제 구축: 교육행정정보의 디지털 전환과 디지털 관리 플랫폼 운영",
    ],
    executions: [
      {
        title: "맞춤형, 브릿지형 연수를 통한 교원의 디지털 역량 강화",
        items: [
          {
            title: "공동성찰, 공동연구, 공동나눔을 위한 맞춤형 교원학습공동체 운영",
            photo: "/images/tasks/common-3-1-1.jpg",
            details: ["교원학습공동체 운영", "전교원 VR 전시회 연수", "BRIDGE 챌린지 및 모델 연수"],
          },
          {
            title: "우리학교 연수원을 통한 맞춤형 연수 운영",
            photo: "/images/tasks/common-3-1-2.jpg",
            details: ["우리학교 연수원 운영", "교내 바이브코딩 연수"],
          },
        ],
      },
      {
        title: "수업나눔을 통한 연구 내용 확산 및 공유",
        items: [
          {
            title: "수업나눔 사례 공유를 위한 소식지 운영",
            photo: "/images/tasks/common-3-2-1.jpg",
            details: ["BRIDGE 뉴스 발간"],
          },
          {
            title: "BRIDGE 모델 확산을 위한 수업나눔",
            photo: "/images/tasks/common-3-2-2.jpg",
            details: ["강남서초 수업 나눔", "싱가포르 대사관 방문 수업 나눔", "2학기 강남서초 수업 나눔"],
          },
          {
            title: "교육과정 재구성 사례 공유",
            photo: "/images/tasks/common-3-2-3.jpg",
            details: ["연구교원 간 BRIDGE 아카이브 운영", "공유 및 확산을 위한 홈페이지 운영"],
          },
        ],
      },
      {
        title: "연구문화 조성을 위한 업무경감 체제 구축",
        items: [
          {
            title: "디지털 관리 플랫폼 운영을 통한 시스템 지원",
            photo: "/images/tasks/common-3-3-1.jpg",
            details: ["고장신고 편의성", "공유기기 관리·대여", "디지털 튜터 지원", "관리자의 기기 관리"],
          },
        ],
      },
    ],
  },
  {
    id: "option-1",
    kind: "선택과제",
    title: "AI·디지털 기반 기초학력 지원 및 맞춤형 학습 보장",
    goal: "AI를 활용한 기초학력 진단 및 맞춤형 학습 지원",
    description:
      "AI 코스웨어의 학습 데이터로 학생의 학습 결손 구간과 성취 수준을 파악하고, 진단 결과에 따른 개별 학습 경로와 보충 학습을 제공해 기초학력을 보장한다.",
    strategies: [
      "AI 코스웨어를 활용한 학생 수준 진단 및 맞춤형 학습 지원: 학생 대시보드와 국가기초학력포털 향상도 평가로 학습 기록 누적",
      "디지털 도구를 활용한 기초학력 보충 수업 운영",
      "기초학력 데이터 기반 교사–학부모 소통 강화: 가정–학교 공유로 교육 소통 강화",
    ],
    executions: [
      {
        title: "AI 코스웨어를 활용한 학생 수준 진단 및 맞춤형 학습 지원",
        items: [
          {
            title: "AI 코스웨어를 활용한 수준 진단 및 학습지원",
            details: ["수학 학생 대시보드", "리딩앤 대시보드", "수학 차시별 학습지원", "학생 수준 진단"],
            photo: "/images/tasks/option-1-1-1.jpg",
          },
          {
            title: "국가기초학력포털을 활용한 향상도 평가 및 학습 기록 누적",
            details: ["학생 향상도 평가"],
            photo: "/images/tasks/option-1-1-2.jpg",
          },
        ],
      },
      {
        title: "디지털 도구를 활용한 기초학력 보충 수업 운영",
        items: [
          {
            title: "디지털 도구를 활용한 키다리쌤 운영",
            photo: "/images/tasks/option-1-2-1.jpg",
          },
        ],
      },
      {
        title: "기초학력 데이터 기반 교사-학부모 소통 강화",
        items: [
          {
            title: "데이터 기반 소통 강화",
            details: ["문해력 보고서"],
            photo: "/images/tasks/option-1-3-1.jpg",
          },
        ],
      },
    ],
  },
  {
    id: "option-2",
    kind: "선택과제",
    title: "AI·디지털 기반 생태전환교육 수업 모델 적용",
    goal: "AI·디지털을 활용한 생태전환교육 확대 및 실천적 환경 감수성 함양",
    description:
      "2학기 학년자율시간을 활용해 BRIDGE 수업 모델을 생태전환교육에 적용한다. 학생이 주변의 환경 문제를 스스로 정의하고 AI·디지털 도구로 탐구해 실천으로 잇도록 한다.",
    strategies: [
      "AI·디지털 도구 기반 생태전환 탐구 수업 설계: 통합·국어·음악·미술·도덕·사회 등 교과와 연계한 학년별 생태전환 탐구 수업 운영",
      "디지털 도구를 활용한 생태전환 실천 활동: 그린 캠페이너 프로젝트 등 학생 주도 실천 활동 운영",
      "생태전환교육 수업 사례 아카이빙 및 확산: 수업 사례 공유 및 저장소 운영",
    ],
    executions: [
      {
        title: "AI·디지털 도구 기반 생태전환 탐구 수업 설계",
        items: [
          {
            title: "2학년 통합: 자연은 디자이너",
            details: ["자연 속 무늬로 옷 디자인하기", "띵커벨·패들렛·클래스툴"],
          },
          {
            title: "4학년 국어: 의견 비교하기",
            details: ["지구위기로 인한 빙하호 붕괴의 원인과 피해배상의 책임 알아보기", "토론 친구"],
          },
          {
            title: "4학년 음악: 노래 가사 바꾸어 부르기",
            details: ["환경을 주제로 노래 가사 바꿔 부르기", "SUNO"],
          },
          {
            title: "4학년 미술: 환경전시회",
            details: ["기후위기·환경파괴를 주제로 그림 전시회 열기", "캔바"],
          },
          {
            title: "4학년 도덕: 쓰레기 줄이는 방법 알아보기",
            details: ["분리배출을 익힐 수 있는 웹사이트 만들기", "Lovable"],
          },
          {
            title: "4학년 창체: 기후 위기 전시관 운영",
            details: ["기후위기 극복에 동참을 제안하는 기후전시관 운영하기", "캔바"],
          },
          {
            title: "4학년 사회: 지역의 환경 문제 해결하기",
            details: ["지역의 환경문제를 찾고 해결방법을 찾아 실천하기", "캔바"],
          },
          {
            title: "6학년 미술: 사물의 소비와 생태 환경 관계 표현하기",
            details: ["생태 미술 작품 만들기", "아트봉봉·캔바"],
          },
        ],
      },
      {
        title: "디지털 도구를 활용한 생태전환 실천 활동",
        items: [
          {
            title: "생태전환 실천 활동",
            photo: "/images/tasks/option-2-2-1.jpg",
          },
        ],
      },
      {
        title: "생태전환교육 수업 사례 아카이빙 및 확산",
        items: [
          {
            title: "수업 사례 공유 및 저장소 운영",
            photo: "/images/tasks/option-2-3-1.jpg",
          },
        ],
      },
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
/** 실행 항목 사진을 운영자가 바꿀 때 쓰는 키. 예: common-1-2-1 (과제 id-가나다 순번-세부 항목 순번) */
export function taskItemKey(taskId: string, executionIndex: number, itemIndex: number): string {
  return `${taskId}-${executionIndex + 1}-${itemIndex + 1}`;
}

/** taskItemKey 로 만들 수 있는 키인지 확인한다. */
export function isTaskItemKey(key: string): boolean {
  return RESEARCH_TASKS.some((task) =>
    task.executions?.some((execution, i) =>
      execution.items.some((_, j) => taskItemKey(task.id, i, j) === key),
    ),
  );
}

export function taskLabel(task: ResearchTask): string {
  const sameKind = RESEARCH_TASKS.filter((t) => t.kind === task.kind);
  const order = sameKind.indexOf(task) + 1;
  return task.kind === "공통과제" ? `과제${order}` : `선택${order}`;
}
