import { describe, expect, it } from "vitest";
import {
  buildUserPrompt,
  LESSON_PLAN_SYSTEM_PROMPT,
} from "@/lib/lesson-plan/prompt";
import type { LessonPlanInput } from "@/lib/lesson-plan/schema";

/**
 * 시스템 프롬프트는 elementary-lesson-plan 스킬 문서 세 개
 * (`src/content/lesson-plan/`)를 그대로 싣는다. 여기서는 문서가 실제로
 * 실렸는지와, 웹 생성기용으로 덧붙인 규칙이 남아 있는지를 확인한다.
 */

const BRIDGE_STAGES = [
  "문제 발견·인식",
  "해결방법 탐색·문제해결",
  "공유·성찰",
];

describe("시스템 프롬프트 — 스킬 문서 적재 (R10)", () => {
  it.each(BRIDGE_STAGES)("BRIDGE 3단계 중 %s 가 정의되어 있다", (stage) => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain(stage);
  });

  it("6단계로 쓰지 말라는 금지 규칙을 담고 있다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("절대 6단계");
  });

  it("1쪽 개요면과 2쪽 전개면을 모두 요구한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("1쪽");
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("2쪽");
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("교수·학습활동");
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("자료 및 지도전략");
  });

  it("칸별 작성 규칙(format-spec)이 실려 있다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("분량 기준표");
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("탐구질문");
  });

  it("도구·문형(phrasebank)이 실려 있다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("실시간피드백");
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("학생 주도성 4요소");
  });

  it("스킬을 고르는 데만 쓰는 frontmatter 는 빼고 싣는다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).not.toContain("name: elementary-lesson-plan");
  });

  it("성취기준·평가기준을 임의 생성하지 말라고 지시한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("그대로");
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("성취기준 코드를 지어내기");
  });
});

describe("시스템 프롬프트 — 웹 생성기용 조정", () => {
  it("폼에서 이미 받았으므로 되묻지 말라고 지시한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("되묻지 말고");
  });

  it("파일을 만들지 말고 마크다운만 출력하게 한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("마크다운 텍스트만");
  });

  it("AI 초안이라는 검수 안내를 넣게 한다", () => {
    expect(LESSON_PLAN_SYSTEM_PROMPT).toContain("검수");
  });
});

describe("buildUserPrompt", () => {
  const input: LessonPlanInput = {
    grade: "4학년",
    semester: "1학기",
    subject: "과학",
    unit: "2단원 물질의 성질",
    period: "3/6차시",
    achievementStandard: "[4과05-01] 물질의 성질을 설명할 수 있다.",
    goal: "물질의 성질에 따라 물체를 분류할 수 있다.",
    task: "교실 물체를 분류하고 기준 설명하기",
    evalCriteriaTop: "두 가지 이상 근거로 정확히 분류하고 설명할 수 있다.",
  };

  it("교사가 입력한 필수 항목을 프롬프트에 그대로 담는다", () => {
    const prompt = buildUserPrompt(input);
    for (const value of Object.values(input)) {
      expect(prompt).toContain(value);
    }
  });

  it("학년·학기·교과를 한 줄로 합쳐 넣는다", () => {
    expect(buildUserPrompt(input)).toContain("학년·학기·교과: 4학년 1학기 과학");
  });

  it("선택 입력은 값이 있을 때만 넣는다", () => {
    const prompt = buildUserPrompt(input);
    expect(prompt).not.toContain("대상학급");
    expect(prompt).not.toContain("교과역량");

    const filled = buildUserPrompt({
      ...input,
      classroom: "4학년 2반",
      competencies: "과학적 탐구능력, 과학적 문제해결력",
      textbookPages: "42-45쪽",
      lessonDate: "2026.5.26.(화)",
      duration: "40분",
    });
    expect(filled).toContain("대상학급: 4학년 2반");
    expect(filled).toContain("교과역량: 과학적 탐구능력, 과학적 문제해결력");
    expect(filled).toContain("교과서 쪽수: 42-45쪽");
    expect(filled).toContain("일시: 2026.5.26.(화)");
    expect(filled).toContain("수업시간: 40분");
  });

  it("디지털 도구를 지정하면 그대로 넣는다", () => {
    expect(buildUserPrompt({ ...input, digitalTools: "패들렛" })).toContain(
      "활용할 디지털 도구: 패들렛",
    );
  });

  it("디지털 도구가 없으면 도구 목록에서 제안하라고 덧붙인다", () => {
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain("지정 없음");
    expect(prompt).toContain("(제안)");
  });

  it("1쪽과 2쪽을 모두 요청한다", () => {
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain("1쪽(개요면)");
    expect(prompt).toContain("2쪽(전개면)");
  });
});
