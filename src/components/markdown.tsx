import type { ReactNode } from "react";

/**
 * 지도안 결과 표시용 최소 마크다운 렌더러.
 *
 * dangerouslySetInnerHTML 을 쓰지 않고 React 엘리먼트만 만든다.
 * 모델이 만든 텍스트에 HTML이 섞여 들어와도 그대로 실행될 여지가 없다.
 * 지원: #~#### 제목, - / 1. 목록, | 표, **굵게**, 수평선, 문단 + `<br>` 줄바꿈.
 */

/** `<br>` 줄바꿈과 **굵게** 만 인라인 처리한다. 그 밖의 HTML 은 글자 그대로 둔다. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/<br\s*\/?>/i).flatMap((line, li) => [
    ...(li > 0 ? [<br key={`${keyPrefix}-br-${li}`} />] : []),
    ...renderBold(line, `${keyPrefix}-${li}`),
  ]);
}

function renderBold(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

const isTableRow = (line: string) => line.trim().startsWith("|");
const isDivider = (line: string) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(line.trim());

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const key = `p-${blocks.length}`;
    blocks.push(
      <p key={key} className="my-3 text-sm leading-relaxed text-ink-700">
        {renderInline(paragraph.join(" "), key)}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const key = `l-${blocks.length}`;
    const className = "my-3 ml-5 space-y-1.5 text-sm leading-relaxed text-ink-700";
    const items = list.items.map((item, i) => (
      <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
    ));
    blocks.push(
      list.ordered ? (
        <ol key={key} className={`list-decimal ${className}`}>
          {items}
        </ol>
      ) : (
        <ul key={key} className={`list-disc ${className}`}>
          {items}
        </ul>
      ),
    );
    list = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }

    // 표
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
        const [head, ...body] = rows;
        const key = `t-${blocks.length}`;
        blocks.push(
          <div
            key={key}
            className="my-4 w-full overflow-x-auto rounded-lg border border-brand-100"
          >
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              {hasHeader && (
                <thead className="bg-brand-50">
                  <tr>
                    {head.map((cell, ci) => (
                      <th
                        key={ci}
                        scope="col"
                        className="px-3 py-2 font-semibold text-brand-800"
                      >
                        {renderInline(cell, `${key}-h-${ci}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {(hasHeader ? body : rows).map((row, ri) => (
                  <tr key={ri} className="border-t border-brand-100">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 align-top leading-relaxed text-ink-700"
                      >
                        {renderInline(cell, `${key}-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }

    // 제목
    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const text = heading[2];
      const key = `h-${blocks.length}`;
      const styles: Record<number, string> = {
        1: "mt-6 mb-3 text-xl font-bold text-brand-900",
        2: "mt-6 mb-3 text-lg font-bold text-brand-800",
        3: "mt-5 mb-2 text-base font-bold text-brand-800",
        4: "mt-4 mb-2 text-sm font-bold text-brand-700",
      };
      const Tag = (["h2", "h3", "h4", "h5"] as const)[level - 1];
      blocks.push(
        <Tag key={key} className={styles[level]}>
          {renderInline(text, key)}
        </Tag>,
      );
      continue;
    }

    // 수평선
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushAll();
      blocks.push(
        <hr key={`hr-${blocks.length}`} className="my-6 border-brand-100" />,
      );
      continue;
    }

    // 목록
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

  return <div>{blocks}</div>;
}
