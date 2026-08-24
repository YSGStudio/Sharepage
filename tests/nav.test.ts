import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RESEARCH_TASKS } from "@/content/research";
import { ALL_NAV_ITEMS, NAV_GROUPS } from "@/lib/nav";

/**
 * 왼쪽 세로 내비게이션의 순서와 링크가 실제 페이지를 가리키는지 확인한다.
 * 메뉴 순서는 방문자가 연구를 훑는 순서라서 실수로 바뀌면 안 된다.
 */

describe("내비게이션 순서", () => {
  it("연구 핵심소개 다음에 교원별 역할·월별 추진현황, 그다음 과제 순서로 온다", () => {
    expect(ALL_NAV_ITEMS.slice(0, 8).map((item) => item.label)).toEqual([
      "연구 핵심소개",
      "교원별 역할",
      "월별 추진현황",
      "과제1",
      "과제2",
      "과제3",
      "선택1",
      "선택2",
    ]);
  });

  it("과제 탭은 연구 과제 5개와 1:1로 대응한다", () => {
    const taskHrefs = NAV_GROUPS.find((g) => g.label === "연구 과제")?.items.map(
      (item) => item.href,
    );
    expect(taskHrefs).toEqual(RESEARCH_TASKS.map((t) => `/tasks/${t.id}`));
  });

  it("메뉴 주소가 중복되지 않는다", () => {
    const hrefs = ALL_NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe("내비게이션 링크 대상", () => {
  const taskIds = new Set(RESEARCH_TASKS.map((t) => t.id));

  it.each(ALL_NAV_ITEMS.map((item) => [item.label, item.href] as const))(
    "%s (%s) 는 실제 페이지를 가리킨다",
    (_label, href) => {
      const taskMatch = href.match(/^\/tasks\/(.+)$/);
      if (taskMatch) {
        // /tasks/[id] 동적 라우트가 처리한다.
        expect(taskIds.has(taskMatch[1])).toBe(true);
        return;
      }
      const page = new URL(`../src/app${href}/page.tsx`, import.meta.url);
      expect(existsSync(page)).toBe(true);
    },
  );
});
