/**
 * 지도안 마크다운을 내보내기용 HTML 로 바꾼다.
 *
 * 화면 렌더러(`components/markdown.tsx`)와 같은 문법만 지원한다:
 * #~#### 제목, - / 1. 목록, | 표, **굵게**, 수평선, 문단 + 표 칸 안의 `<br>`.
 * 모델 출력은 신뢰하지 않으므로 먼저 전부 이스케이프하고, 허용한 태그만 되살린다.
 *
 * 한글(.hwp) 변환기는 블록을 하나씩 붙여 넣어야 안정적이라 블록 배열로 돌려준다.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 이스케이프 후 `<br>` 과 **굵게** 만 태그로 되살린다.
 *
 * 굵게가 섞인 줄은 보통 글자 구간도 `font-weight:normal` 로 감싼다.
 * 한글 변환기(rhwp)는 굵게를 닫은 뒤에도 문단 끝까지 굵게를 이어 가기 때문이다.
 */
function renderInline(text: string): string {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((part) => part !== "");
  const hasBold = parts.some((part) => part.startsWith("**") && part.length > 4);

  return parts
    .map((part) => {
      const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;
      const html = escapeHtml(isBold ? part.slice(2, -2) : part).replace(
        /&lt;br\s*\/?&gt;/gi,
        "<br>",
      );
      if (isBold) return `<span style="font-weight:bold">${html}</span>`;
      return hasBold ? `<span style="font-weight:normal">${html}</span>` : html;
    })
    .join("");
}

/** 한글 변환기는 CSS 규칙을 읽지 않으므로 칸 테두리를 인라인으로 준다. */
const CELL_STYLE = "border:1px solid #000";

function splitRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

const isTableRow = (line: string) => line.trim().startsWith("|");
const isDivider = (line: string) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(line.trim());

const HEADING_TAGS = ["h1", "h2", "h3", "h4"] as const;

export function lessonPlanToHtmlBlocks(markdown: string): string[] {
  const lines = markdown.split("\n");
  const blocks: string[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    // 원문의 줄바꿈을 살린다. 지도안은 "제목: …", "연관검색어: …" 처럼 줄 단위 항목이 많다.
    blocks.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const tag = list.ordered ? "ol" : "ul";
    const items = list.items.map((item) => `<li>${renderInline(item)}</li>`).join("");
    blocks.push(`<${tag}>${items}</${tag}>`);
    list = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }

    if (isTableRow(trimmed)) {
      flushAll();
      const rows: string[][] = [];
      let hasHeader = false;
      while (i < lines.length && isTableRow(lines[i].trim())) {
        const current = lines[i].trim();
        if (isDivider(current)) {
          hasHeader = rows.length === 1;
        } else {
          rows.push(splitRow(current));
        }
        i++;
      }
      i--;

      if (rows.length > 0) {
        const html = rows
          .map((row, ri) => {
            const tag = hasHeader && ri === 0 ? "th" : "td";
            const cells = row
              .map((cell) => `<${tag} style="${CELL_STYLE}">${renderInline(cell)}</${tag}>`)
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");
        blocks.push(`<table>${html}</table>`);
      }
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll();
      const tag = HEADING_TAGS[heading[1].length - 1];
      blocks.push(`<${tag}>${renderInline(heading[2])}</${tag}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushAll();
      blocks.push("<hr>");
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.*)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (unordered || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      const item = (unordered?.[1] ?? ordered?.[1]) as string;
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push(item);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushAll();
  return blocks;
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
  const body = lessonPlanToHtmlBlocks(markdown).join("\n");
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
