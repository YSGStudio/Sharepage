import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { HwpDocument, initSync } from "@rhwp/core";
import { beforeAll, describe, expect, it } from "vitest";
import {
  lessonPlanToHtmlBlocks,
  lessonPlanToPrintHtml,
} from "@/lib/lesson-plan/export-html";
import { buildLessonPlanHwp } from "@/lib/lesson-plan/export-hwp";

const SAMPLE = `## ■ 1쪽 — 개요면

[4학년 1학기 과학]
제목: 성질로 나누는 우리 교실 물체
연관검색어: #물질의성질 #분류기준

### ■ 수업소개
교실에서 찾은 물체를 **물질의 성질**을 기준으로 분류한다.

### ■ 교수·학습과정안
| 단원 | 2단원 | 대상학급 | 4학년 2반 | 일시 | 2026.5.26.(화) |
|---|---|---|---|---|---|
| 차시 | 3/6차시<br>(42-45쪽) | 수업모형 | BRIDGE 프로젝트 모형 | 교과역량 | 과학적 탐구능력 |

- 성취기준: [4과05-01] 여러 가지 물체를 관찰한다.
- 탐구질문: 왜 어떤 컵은 깨질까?

---

## ■ 2쪽 — 전개면

| BRIDGE 단계 | 교수·학습활동 | 자료 및 지도전략 |
|---|---|---|
| BR<br>(7') | ◉ 동기 유발<br>- 무엇이 달랐을까요? | [자료] 영상 |
| ID<br>(25') | ◉ 활동1 교실 물체 찾기 | [평가] 관찰평가 |

이 지도안은 AI가 만든 초안입니다.`;

describe("lessonPlanToHtmlBlocks", () => {
  it("모델 출력의 HTML 은 이스케이프하고 <br> 과 굵게만 살린다", () => {
    const [html] = lessonPlanToHtmlBlocks(
      '<script>alert(1)</script> **굵게** <img src=x onerror="a">',
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain('<span style="font-weight:bold">굵게</span>');

    const [cell] = lessonPlanToHtmlBlocks("| BR<br>(7') | a |");
    expect(cell).toContain("BR<br>(7')");
  });

  it("굵게가 섞인 줄은 보통 글자도 굵기를 명시한다", () => {
    const [html] = lessonPlanToHtmlBlocks("앞 **굵게** 뒤");
    expect(html).toBe(
      '<p><span style="font-weight:normal">앞 </span><span style="font-weight:bold">굵게</span><span style="font-weight:normal"> 뒤</span></p>',
    );
  });

  it("제목·문단·표·목록·수평선을 블록으로 나눈다", () => {
    const blocks = lessonPlanToHtmlBlocks(SAMPLE);
    expect(blocks.map((b) => b.match(/^<(\w+)/)?.[1])).toEqual([
      "h2", "p", "h3", "p", "h3", "table", "ul", "hr", "h2", "table", "p",
    ]);
    // 줄 단위 항목은 한 문단 안에서 줄바꿈으로 남는다.
    expect(blocks[1]).toBe(
      "<p>[4학년 1학기 과학]<br>제목: 성질로 나누는 우리 교실 물체<br>연관검색어: #물질의성질 #분류기준</p>",
    );
    expect(blocks[9]).toContain('<th style="border:1px solid #000">BRIDGE 단계</th>');
  });

  it("인쇄용 문서는 제목을 이스케이프하고 인쇄를 호출한다", () => {
    const html = lessonPlanToPrintHtml(SAMPLE, "<지도안>");
    expect(html).toContain("<title>&lt;지도안&gt;</title>");
    expect(html).toContain("window.print()");
  });
});

describe("buildLessonPlanHwp", () => {
  beforeAll(() => {
    const pkgDir = dirname(
      createRequire(import.meta.url).resolve("@rhwp/core/package.json"),
    );
    initSync({ module: readFileSync(join(pkgDir, "rhwp_bg.wasm")) });
    // 조판용 글자 폭 측정기. 테스트에서는 대략값이면 충분하다.
    (globalThis as Record<string, unknown>).measureTextWidth = (
      _font: string,
      text: string,
    ) => text.length * 12;
  });

  it("한글 5.0 파일을 만들고, 다시 열었을 때 표와 본문이 남아 있다", () => {
    const bytes = buildLessonPlanHwp(HwpDocument, SAMPLE);

    // CFB(OLE2) 시그니처 — 한글 5.0 바이너리의 컨테이너
    expect([...bytes.slice(0, 8)]).toEqual([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    if (process.env.HWP_SAMPLE_OUT) writeFileSync(process.env.HWP_SAMPLE_OUT, bytes);

    const reopened = new HwpDocument(bytes);
    const svg = Array.from({ length: reopened.pageCount() }, (_, p) =>
      reopened.renderPageSvg(p),
    ).join("");
    reopened.free();

    const text = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)]
      .map((m) => m[1])
      .join("");
    for (const expected of ["수업소개", "대상학급", "BRIDGE", "관찰평가", "초안입니다"]) {
      expect(text.replace(/\s/g, "")).toContain(expected);
    }
  });
});
