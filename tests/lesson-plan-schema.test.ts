import { describe, expect, it } from "vitest";
import {
  DEFAULT_DURATION,
  DEFAULT_PERIOD,
  REQUIRED_FIELDS,
  validateLessonPlanInput,
} from "@/lib/lesson-plan/schema";

const COMPLETE_INPUT = {
  grade: "4학년",
  subject: "과학",
  achievementStandard:
    "[4과05-01] 여러 가지 물체를 관찰하여 물질의 성질을 설명할 수 있다.",
  goal: "물질의 성질에 따라 물체를 분류할 수 있다.",
  task: "교실에서 찾은 물체를 성질 기준으로 분류하고 분류 기준을 설명하기",
  evalCriteriaTop:
    "물질의 성질을 두 가지 이상 근거로 들어 물체를 정확히 분류하고 기준을 설명할 수 있다.",
};

describe("validateLessonPlanInput — 필수 6항목 (R9)", () => {
  it("6항목이 모두 채워지면 통과한다", () => {
    const result = validateLessonPlanInput(COMPLETE_INPUT);
    expect(result.ok).toBe(true);
  });

  it.each(REQUIRED_FIELDS)("%s 가 비면 거부한다", (field) => {
    const result = validateLessonPlanInput({ ...COMPLETE_INPUT, [field]: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toContain(field);
      expect(result.message).toMatch(/필수 항목/);
    }
  });

  it("공백만 있는 값은 비어 있는 것으로 본다", () => {
    const result = validateLessonPlanInput({ ...COMPLETE_INPUT, goal: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.missing).toEqual(["goal"]);
  });

  it("여러 항목이 비면 누락 항목을 모두 알려준다", () => {
    const result = validateLessonPlanInput({
      ...COMPLETE_INPUT,
      grade: "",
      task: "",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toEqual(["grade", "task"]);
      expect(result.message).toContain("학년");
      expect(result.message).toContain("수행과제");
    }
  });

  it("본문이 아예 없어도 터지지 않고 6항목 모두 누락으로 처리한다", () => {
    const result = validateLessonPlanInput(undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.missing).toEqual([...REQUIRED_FIELDS]);
  });

  it("선택 입력이 없으면 기본값을 채운다", () => {
    const result = validateLessonPlanInput(COMPLETE_INPUT);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.period).toBe(DEFAULT_PERIOD);
      expect(result.value.duration).toBe(DEFAULT_DURATION);
      expect(result.value.digitalTools).toBe("");
    }
  });

  it("선택 입력이 있으면 그대로 유지한다", () => {
    const result = validateLessonPlanInput({
      ...COMPLETE_INPUT,
      period: "3/5차시",
      duration: "80분",
      digitalTools: "패들렛, 구글 슬라이드",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.period).toBe("3/5차시");
      expect(result.value.duration).toBe("80분");
      expect(result.value.digitalTools).toBe("패들렛, 구글 슬라이드");
    }
  });

  it("입력값의 앞뒤 공백을 정리한다", () => {
    const result = validateLessonPlanInput({
      ...COMPLETE_INPUT,
      grade: "  4학년  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.grade).toBe("4학년");
  });
});
