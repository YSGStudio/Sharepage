import { writeFileSync } from "node:fs";
import { Packer } from "docx";
// docx 가 .docx(zip) 를 만들 때 쓰는 라이브러리다. 결과 XML 을 꺼내 확인하는 데 쓴다.
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { parseInline, parseLessonPlan } from "@/lib/lesson-plan/export-blocks";
import { buildLessonPlanDocument } from "@/lib/lesson-plan/export-docx";
import { lessonPlanToHtml, lessonPlanToPrintHtml } from "@/lib/lesson-plan/export-html";

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

1. 첫째 활동
2. 둘째 활동

---

## ■ 2쪽 — 전개면

| BRIDGE 단계 | 교수·학습활동 | 자료 및 지도전략 |
|---|---|---|
| BR<br>(7') | ◉ 동기 유발<br>- 무엇이 달랐을까요? | [자료] 영상 |
| ID<br>(25') | ◉ 활동1 교실 물체 찾기 | [평가] 관찰평가 |

이 지도안은 AI가 만든 초안입니다.`;

describe("parseLessonPlan", () => {
  it("제목·문단·표·목록·수평선을 블록으로 나눈다", () => {
    const blocks = parseLessonPlan(SAMPLE);
    expect(blocks.map((b) => b.type)).toEqual([
      "heading", "paragraph", "heading", "paragraph", "heading", "table",
      "list", "list", "hr", "heading", "table", "paragraph",
    ]);
    // 줄 단위 항목은 한 문단 안의 줄로 남는다.
    expect(blocks[1]).toMatchObject({ type: "paragraph" });
    expect((blocks[1] as { text: unknown[] }).text).toHaveLength(3);
    expect(blocks[10]).toMatchObject({ type: "table", hasHeader: true });
    expect(blocks[5]).toMatchObject({ type: "table", hasHeader: true });
  });

  it("<br> 은 줄로, **굵게** 는 굵은 조각으로 나눈다", () => {
    expect(parseInline("앞 **굵게** 뒤<br>둘째 줄")).toEqual([
      [
        { text: "앞 ", bold: false },
        { text: "굵게", bold: true },
        { text: " 뒤", bold: false },
      ],
      [{ text: "둘째 줄", bold: false }],
    ]);
  });
});

describe("PDF 인쇄용 HTML", () => {
  it("모델 출력의 HTML 은 이스케이프하고 <br>·굵게만 태그로 만든다", () => {
    const html = lessonPlanToHtml('<script>alert(1)</script> **굵게** <img src=x onerror="a">');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<b>굵게</b>");
    expect(lessonPlanToHtml("| BR<br>(7') | a |")).toContain("<td>BR<br>(7')</td>");
  });

  it("제목을 이스케이프하고 인쇄를 호출한다", () => {
    const html = lessonPlanToPrintHtml(SAMPLE, "<지도안>");
    expect(html).toContain("<title>&lt;지도안&gt;</title>");
    expect(html).toContain("window.print()");
  });
});

describe("Word(.docx)", () => {
  it("본문·표·굵게·줄바꿈이 들어간 .docx 를 만든다", async () => {
    const buffer = await Packer.toBuffer(buildLessonPlanDocument(SAMPLE));
    if (process.env.DOCX_SAMPLE_OUT) writeFileSync(process.env.DOCX_SAMPLE_OUT, buffer);

    // .docx 는 zip 이다.
    expect([...buffer.subarray(0, 2)]).toEqual([0x50, 0x4b]);
    const xml = await (await JSZip.loadAsync(buffer)).file("word/document.xml")!.async("string");

    for (const text of ["수업소개", "대상학급", "BRIDGE 단계", "무엇이 달랐을까요?", "초안입니다"]) {
      expect(xml).toContain(text);
    }
    expect(xml.match(/<w:tbl>/g)).toHaveLength(2);
    expect(xml).toContain("<w:br/>");
    expect(xml).toMatch(/<w:b\/>[\s\S]*?물질의 성질/);
    // 모델 출력의 < > 는 XML 로 이스케이프되어 문서가 깨지지 않는다.
    const escaped = await Packer.toBuffer(buildLessonPlanDocument("<b>a</b> & c"));
    const escapedXml = await (await JSZip.loadAsync(escaped)).file("word/document.xml")!.async("string");
    expect(escapedXml).toContain("&lt;b&gt;a&lt;/b&gt; &amp; c");
  });
});
