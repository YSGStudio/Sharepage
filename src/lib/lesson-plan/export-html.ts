/**
 * 지도안을 PDF 로 저장하기 위한 인쇄용 HTML 을 만든다.
 * 모델 출력은 신뢰하지 않으므로 글자는 모두 이스케이프하고, 태그는 여기서만 만든다.
 */

import { parseLessonPlan, type Block, type RichText } from "./export-blocks";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function richTextToHtml(text: RichText): string {
  return text
    .map((line) =>
      line
        .map((run) => (run.bold ? `<b>${escapeHtml(run.text)}</b>` : escapeHtml(run.text)))
        .join(""),
    )
    .join("<br>");
}

function blockToHtml(block: Block): string {
  switch (block.type) {
    case "heading":
      return `<h${block.level}>${richTextToHtml(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${richTextToHtml(block.text)}</p>`;
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      return `<${tag}>${block.items.map((item) => `<li>${richTextToHtml(item)}</li>`).join("")}</${tag}>`;
    }
    case "table": {
      const rows = block.rows.map((row, ri) => {
        const tag = block.hasHeader && ri === 0 ? "th" : "td";
        return `<tr>${row.map((cell) => `<${tag}>${richTextToHtml(cell)}</${tag}>`).join("")}</tr>`;
      });
      return `<table>${rows.join("")}</table>`;
    }
    case "hr":
      return "<hr>";
  }
}

export function lessonPlanToHtml(markdown: string): string {
  return parseLessonPlan(markdown).map(blockToHtml).join("\n");
}

const PRINT_STYLE = `
@page { size: A4; margin: 15mm; }
* { box-sizing: border-box; }
body {
  margin: 0;
  color: #111;
  font-family: "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  font-size: 10.5pt;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
h1 { font-size: 16pt; margin: 0 0 10pt; }
h2 { font-size: 14pt; margin: 16pt 0 8pt; }
h3 { font-size: 12pt; margin: 14pt 0 6pt; }
h4 { font-size: 11pt; margin: 12pt 0 6pt; }
h1, h2, h3, h4 { break-after: avoid; }
p, ul, ol { margin: 6pt 0; }
ul, ol { padding-left: 18pt; }
hr { border: 0; border-top: 1px solid #999; margin: 12pt 0; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
th, td { border: 1px solid #555; padding: 4pt 6pt; vertical-align: top; text-align: left; }
th { background: #eef2f7; font-weight: 700; }
tr { break-inside: avoid; }
`;

/** 인쇄 창에 그대로 쓰는 완결된 HTML 문서. 열리면 인쇄 대화상자를 띄운다. */
export function lessonPlanToPrintHtml(markdown: string, title: string): string {
  const body = lessonPlanToHtml(markdown);
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>${PRINT_STYLE}</style>
</head>
<body>
${body}
<script>window.addEventListener("load", function () { window.print(); });</script>
</body>
</html>`;
}
