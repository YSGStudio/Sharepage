import { describe, expect, it } from "vitest";
import {
  buildUserPrompt,
  LESSON_PLAN_SYSTEM_PROMPT,
} from "@/lib/lesson-plan/prompt";

const BRIDGE_STAGES = [
  "Buzz",
  "Related",
  "Investigate Together",
  "Do & Make",
  "Give & Share",
  "Evaluate & Grow",
];

const EIGHT_SECTIONS = [
  "기본정보",
  "학습목표",
  "성취기준",
  "교수학습자료",
  "BRIDGE 단계별 과정안",
  "평가계획",
  "지도상의 유의점",
  "검수 안내",
];

describe("시스템 프롬프트 — BRIDGE 형식 (R10)", () => {
  it.each(BRIDGE_STAGES)("BRIDGE 6단계 중 %s 가 정의되어 있다", (stage) => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain(stage);
  });

  it.each(EIGHT_SECTIONS)("출력 8개 섹션 중 %s 를 요구한다", (section) => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain(section);
  });

  it("성취기준·평가기준을 임의 생성하지 말라고 지시한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toMatch(/그대로/);
    expect(LESSON_PLAN_SYSTEM_PROMPT).toMatch(/임의로 만들거나 바꾸지 않는다/);
  });

  it("단계명을 도입·전개·정리로 바꿔 쓰지 말라고 지시한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain(
      '"도입·전개·정리"로 바꿔 쓰지 않는다',
    );
  });

  it("파일 생성을 금지한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("파일을 만들지 않는다");
  });
});

describe("buildUserPrompt", () => {
  const input = {
    grade: "4학년",
    subject: "과학",
    achievementStandard: "[4과05-01] 물질의 성질을 설명할 수 있다.",
    goal: "물질의 성질에 따라 물체를 분류할 수 있다.",
    task: "교실 물체를 분류하고 기준 설명하기",
    evalCriteriaTop: "두 가지 이상 근거로 정확히 분류하고 설명할 수 있다.",
  };

  it("교사가 입력한 6항목을 프롬프트에 그대로 담는다", () => {
    const prompt = buildUserPrompt(input);
    for (const value of Object.values(input)) {
      expect(prompt).toContain(value);
    }
  });

  it("차시·수업시간 기본값을 명시한다", () => {
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain("차시: 본시");
    expect(prompt).toContain("수업시간: 40분");
  });

  it("디지털 도구를 지정하면 그대로 넣는다", () => {
    const prompt = buildUserPrompt({ ...input, digitalTools: "패들렛" });
    expect(prompt).toContain("패들렛");
  });

  it("디지털 도구가 없으면 제품명을 단정하지 말라고 덧붙인다", () => {
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain("지정 없음");
  });
});
