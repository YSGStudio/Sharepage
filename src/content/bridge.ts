/**
 * BRIDGE 모델 정적 콘텐츠 (R2).
 * 지도안 생성 프롬프트(src/lib/lesson-plan/prompt.ts)와 같은 6단계 정의를 쓴다.
 */

export type BridgePhaseGroup = "도입" | "전개" | "전개→정리" | "정리";

export interface BridgeStage {
  letter: string;
  name: string;
  korean: string;
  group: BridgePhaseGroup;
  purpose: string;
  teacherRole: string;
  studentActivity: string;
  agency: string[];
  digitalUse: string;
}

export const BRIDGE_STAGES: BridgeStage[] = [
  {
    letter: "B",
    name: "Buzz",
    korean: "생각 깨우기",
    group: "도입",
    purpose:
      "주제와 관련된 경험·궁금증을 자유롭게 꺼내 놓으며 학습에 대한 관심과 필요를 만든다.",
    teacherRole:
      "정답을 요구하지 않는 열린 발문으로 모든 학생이 한 마디씩 꺼내도록 한다.",
    studentActivity:
      "짝·모둠과 짧게 이야기 나누기, 떠오르는 생각을 한 문장으로 적기",
    agency: ["학생 목소리"],
    digitalUse: "실시간 의견 수집 도구로 모든 학생의 생각을 한 화면에 모은다.",
  },
  {
    letter: "R",
    name: "Related",
    korean: "연결하기",
    group: "도입",
    purpose:
      "이미 알고 있는 것, 배운 것, 실제 삶과 오늘의 학습 문제를 연결해 학습 목표를 학생의 언어로 세운다.",
    teacherRole:
      "학생들이 꺼낸 생각을 학습 문제로 다듬어 주고, 오늘 무엇을 해결할지 함께 확인한다.",
    studentActivity:
      "선수 학습 떠올리기, 생활 속 사례 찾기, 학습 문제 함께 정하기",
    agency: ["학생 목소리", "선택"],
    digitalUse: "지난 학습 기록·자료를 다시 꺼내 보며 연결 고리를 확인한다.",
  },
  {
    letter: "I",
    name: "Investigate Together",
    korean: "함께 탐구하기",
    group: "전개",
    purpose:
      "필요한 정보와 자료를 모으고 비교하며, 문제 해결에 필요한 개념과 방법을 협력적으로 탐구한다.",
    teacherRole:
      "탐구 방향을 좁혀 주는 안내 발문을 하고, 자료의 신뢰성을 함께 따져 본다.",
    studentActivity:
      "모둠별 자료 조사, 관찰·실험, 정보 비교와 분류, 탐구 결과 정리",
    agency: ["협력", "선택"],
    digitalUse:
      "검색·자료 정리 도구로 정보를 모으고, 공유 문서로 모둠 탐구 결과를 함께 쓴다.",
  },
  {
    letter: "D",
    name: "Do & Make",
    korean: "해보고 만들기",
    group: "전개",
    purpose:
      "탐구한 내용을 실제 산출물로 만들어 보며, 아는 것을 할 수 있는 것으로 옮긴다.",
    teacherRole:
      "산출물의 형태를 학생이 고르게 하고, 막힌 모둠에 최소한의 힌트를 준다.",
    studentActivity:
      "글·그림·발표자료·영상·모형 등 선택한 형태로 결과물 제작",
    agency: ["선택", "책임"],
    digitalUse:
      "제작 도구를 목적에 맞게 골라 쓰되, 도구 사용 자체가 목표가 되지 않게 한다.",
  },
  {
    letter: "G",
    name: "Give & Share",
    korean: "나누기",
    group: "전개→정리",
    purpose:
      "만든 것을 친구·학급·학교와 나누고 서로의 결과에서 배우며 학습을 넓힌다.",
    teacherRole:
      "발표가 아니라 나눔이 되도록, 듣는 학생의 역할(질문·칭찬·제안)을 함께 정한다.",
    studentActivity:
      "모둠 순회 나눔, 학급 전시, 상호 피드백 주고받기",
    agency: ["협력", "학생 목소리"],
    digitalUse: "온라인 게시판·아카이브에 결과물을 올려 학급을 넘어 공유한다.",
  },
  {
    letter: "E",
    name: "Evaluate & Grow",
    korean: "돌아보고 자라기",
    group: "정리",
    purpose:
      "학습 목표 도달을 스스로 점검하고, 다음 학습에서 무엇을 더 할지 정하며 성장의 방향을 세운다.",
    teacherRole:
      "평가 기준을 학생과 공유하고, 결과가 아닌 성장 과정에 대한 피드백을 준다.",
    studentActivity: "자기평가·상호평가, 배운 점과 더 알고 싶은 점 적기",
    agency: ["책임", "학생 목소리"],
    digitalUse: "자기평가 기록을 누적해 학기 단위 성장 과정을 확인한다.",
  },
];

export interface AgencyElement {
  name: string;
  description: string;
  stages: string[];
}

/** 학생 주도성 4요소 */
export const AGENCY_ELEMENTS: AgencyElement[] = [
  {
    name: "선택",
    description:
      "무엇을 탐구할지, 어떤 형태로 만들지 학생이 고른다. 선택지가 있어야 학습이 자기 것이 된다.",
    stages: ["Related", "Investigate Together", "Do & Make"],
  },
  {
    name: "책임",
    description:
      "고른 것을 끝까지 해내고, 결과를 스스로 점검한다. 선택에는 마무리가 따른다는 것을 배운다.",
    stages: ["Do & Make", "Evaluate & Grow"],
  },
  {
    name: "학생 목소리",
    description:
      "생각을 말하고, 학습 문제를 함께 정하고, 배운 것을 자기 언어로 표현한다.",
    stages: ["Buzz", "Related", "Give & Share", "Evaluate & Grow"],
  },
  {
    name: "협력",
    description:
      "혼자서는 못 하는 문제를 함께 푼다. 서로의 결과에서 배우는 것도 협력이다.",
    stages: ["Investigate Together", "Give & Share"],
  },
];

export const BRIDGE_PRINCIPLES = [
  {
    title: "도구가 아니라 학습이 중심",
    body: "AI·디지털 도구는 각 단계의 목적을 이루기 위한 수단이다. 도구를 쓰는 것 자체가 수업 목표가 되지 않도록 단계별 활용 목적을 먼저 정한다.",
  },
  {
    title: "단계는 순서이자 점검표",
    body: "여섯 단계를 매 차시 모두 채울 필요는 없다. 다만 한 단원 안에서는 여섯 단계가 모두 나타나도록 설계해 탐구–제작–나눔–성찰의 순환을 완성한다.",
  },
  {
    title: "단계명을 바꿔 쓰지 않는다",
    body: "BRIDGE 단계를 '도입·전개·정리'로 치환하면 모델의 의도가 사라진다. 지도안과 수업 기록에서 단계명을 그대로 쓴다.",
  },
  {
    title: "평가는 성장을 향한다",
    body: "Evaluate & Grow 단계의 평가는 서열이 아니라 다음 학습의 출발점을 찾기 위한 것이다. 기준을 학생과 미리 공유한다.",
  },
];
