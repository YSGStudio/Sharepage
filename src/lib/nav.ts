export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * 왼쪽 세로 내비게이션. 방문자가 연구를 순서대로 훑을 수 있게 배열 순서를 유지한다.
 * 순서: 연구 핵심소개 → 교원별 역할 → 월별 추진현황 → 과제 1~3, 선택 1~2 → 모델·결과 → 자료 나눔.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "연구 소개",
    items: [
      { href: "/about", label: "연구 핵심소개" },
      { href: "/roles", label: "교원별 역할" },
      { href: "/timeline", label: "월별 추진현황" },
    ],
  },
  {
    label: "연구 과제",
    items: [
      { href: "/tasks/common-1", label: "과제1" },
      { href: "/tasks/common-2", label: "과제2" },
      { href: "/tasks/common-3", label: "과제3" },
      { href: "/tasks/option-1", label: "선택1" },
      { href: "/tasks/option-2", label: "선택2" },
    ],
  },
  {
    label: "모델·결과",
    items: [
      { href: "/model", label: "BRIDGE 모델" },
      { href: "/results", label: "연구 결과" },
    ],
  },
  {
    label: "자료 나눔",
    items: [
      { href: "/materials", label: "수업자료" },
      { href: "/news", label: "브릿지 뉴스" },
      { href: "/gallery", label: "운영 사진" },
      { href: "/testimonials", label: "학부모·학생 소감" },
    ],
  },
  {
    label: "도구",
    items: [{ href: "/lesson-plan", label: "BRAIDGE 지도안 만들기" }],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
