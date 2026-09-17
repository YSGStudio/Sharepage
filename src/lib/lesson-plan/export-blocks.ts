/**
 * 지도안 마크다운을 내보내기용 블록으로 나눈다. Word(.docx)와 PDF(인쇄) 가 함께 쓴다.
 *
 * 화면 렌더러(`components/markdown.tsx`)와 같은 문법만 지원한다:
 * #~#### 제목, - / 1. 목록, | 표, **굵게**, 수평선, 문단 + 표 칸 안의 `<br>`.
 */

/** 한 줄 안의 글자 조각 */
export interface Run {
  text: string;
  bold: boolean;
}

/** `<br>` 로 나뉜 줄들. 각 줄은 글자 조각의 배열이다. */
export type RichText = Run[][];

export type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: RichText }
  | { type: "paragraph"; text: RichText }
  | { type: "list"; ordered: boolean; items: RichText[] }
  | { type: "table"; hasHeader: boolean; rows: RichText[][] }
  | { type: "hr" };

/** `<br>` 줄바꿈과 **굵게** 를 나눈다. 그 밖의 HTML 은 글자 그대로 둔다. */
export function parseInline(text: string): RichText {
  return text.split(/<br\s*\/?>/i).map((line) =>
    line
      .split(/(\*\*[^*]+\*\*)/g)
      .filter((part) => part !== "")
      .map((part) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4
          ? { text: part.slice(2, -2), bold: true }
          : { text: part, bold: false },
      ),
  );
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

const isTableRow = (line: string) => line.trim().startsWith("|");
const isDivider = (line: string) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(line.trim());

export function parseLessonPlan(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    // 원문의 줄바꿈을 살린다. 지도안은 "제목: …", "연관검색어: …" 처럼 줄 단위 항목이 많다.
    blocks.push({ type: "paragraph", text: parseInline(paragraph.join("<br>")) });
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    blocks.push({ type: "list", ordered: list.ordered, items: list.items.map(parseInline) });
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
        blocks.push({
          type: "table",
          hasHeader,
          rows: rows.map((row) => row.map(parseInline)),
        });
      }
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll();
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text: parseInline(heading[2]),
      });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushAll();
      blocks.push({ type: "hr" });
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
