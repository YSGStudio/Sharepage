export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** 상단 내비게이션. 방문자가 연구를 순서대로 훑을 수 있게 배열 순서를 유지한다. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "연구 소개",
    items: [
      { href: "/about", label: "연구 핵심소개" },
      { href: "/model", label: "BRIDGE 모델" },
      { href: "/roles", label: "교원별 역할" },
      { href: "/timeline", label: "월별 추진현황" },
      { href: "/results", label: "연구 결과" },
    ],
  },
  {
    label: "자료 나눔",
    items: [
      { href: "/materials", label: "수업자료" },
      { href: "/gallery", label: "운영 사진" },
      { href: "/testimonials", label: "학부모·학생 소감" },
    ],
  },
  {
    label: "도구",
    items: [{ href: "/lesson-plan", label: "BRIDGE 지도안 만들기" }],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
