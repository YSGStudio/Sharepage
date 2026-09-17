import {
  AlignmentType,
  BorderStyle,
  Document,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  type IParagraphOptions,
} from "docx";
import { parseLessonPlan, type Block, type RichText } from "./export-blocks";

/**
 * 지도안 마크다운을 Word(.docx) 문서로 만든다. 브라우저·Node 모두에서 동작한다.
 * 한글·구글 문서·LibreOffice 에서도 열리도록 표 열 너비를 고정값으로 준다.
 */

/** A4, 여백 15mm (단위: twip = 1/20pt) */
const PAGE = { width: 11906, height: 16838, margin: 850 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

const FONT = { ascii: "Malgun Gothic", hAnsi: "Malgun Gothic", eastAsia: "맑은 고딕", cs: "Malgun Gothic" };

/** 제목 크기 (단위: half-point) */
const HEADING_SIZE = { 1: 32, 2: 28, 3: 24, 4: 22 } as const;

const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "555555" };

function runs(text: RichText, options: { bold?: boolean; size?: number } = {}): TextRun[] {
  return text.flatMap((line, li) => {
    const lineRuns = line.map(
      (run, ri) =>
        new TextRun({
          text: run.text,
          bold: options.bold || run.bold,
          size: options.size,
          // 둘째 줄부터는 첫 조각 앞에서 줄을 바꾼다(<br>).
          break: li > 0 && ri === 0 ? 1 : undefined,
        }),
    );
    // 빈 줄도 줄바꿈은 남긴다.
    return lineRuns.length > 0 || li === 0 ? lineRuns : [new TextRun({ text: "", break: 1 })];
  });
}

function blockToDocx(block: Block, listIndex: number): (Paragraph | Table)[] {
  switch (block.type) {
    case "heading":
      return [
        new Paragraph({
          children: runs(block.text, { bold: true, size: HEADING_SIZE[block.level] }),
          spacing: { before: 240, after: 120 },
          keepNext: true,
        }),
      ];

    case "paragraph":
      return [new Paragraph({ children: runs(block.text), spacing: { after: 120 } })];

    case "list":
      return block.items.map((item) => {
        const numbering: IParagraphOptions = block.ordered
          ? { numbering: { reference: "ordered", level: 0, instance: listIndex } }
          : { bullet: { level: 0 } };
        return new Paragraph({ children: runs(item), spacing: { after: 60 }, ...numbering });
      });

    case "table": {
      const columns = Math.max(...block.rows.map((row) => row.length));
      const columnWidth = Math.floor(CONTENT_WIDTH / columns);
      return [
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: Array.from({ length: columns }, () => columnWidth),
          layout: TableLayoutType.FIXED,
          borders: {
            top: CELL_BORDER,
            bottom: CELL_BORDER,
            left: CELL_BORDER,
            right: CELL_BORDER,
            insideHorizontal: CELL_BORDER,
            insideVertical: CELL_BORDER,
          },
          rows: block.rows.map((row, ri) => {
            const isHeader = block.hasHeader && ri === 0;
            // 칸 수가 모자란 줄은 빈 칸으로 채워 표가 어긋나지 않게 한다.
            const cells = Array.from({ length: columns }, (_, ci) => row[ci] ?? [[]]);
            return new TableRow({
              tableHeader: isHeader,
              cantSplit: true,
              children: cells.map(
                (cell) =>
                  new TableCell({
                    width: { size: columnWidth, type: WidthType.DXA },
                    margins: { top: 60, bottom: 60, left: 100, right: 100 },
                    shading: isHeader ? { fill: "EEF2F7" } : undefined,
                    children: [new Paragraph({ children: runs(cell, { bold: isHeader }) })],
                  }),
              ),
            });
          }),
        }),
        // 표가 바로 이어지면 Word 가 한 표로 붙여 버리므로 빈 문단을 둔다.
        new Paragraph({ children: [], spacing: { after: 120 } }),
      ];
    }

    case "hr":
      return [
        new Paragraph({
          children: [],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 1 } },
          spacing: { after: 200 },
        }),
      ];
  }
}

export function buildLessonPlanDocument(markdown: string): Document {
  let listIndex = 0;
  const children = parseLessonPlan(markdown).flatMap((block) => {
    // 번호 목록은 목록마다 1번부터 다시 센다.
    if (block.type === "list" && block.ordered) listIndex += 1;
    return blockToDocx(block, listIndex);
  });

  return new Document({
    creator: "BRIDGE 지도안 생성기",
    title: "BRIDGE 교수·학습과정안",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 21 },
          paragraph: { spacing: { line: 300 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "ordered",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 400, hanging: 300 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
              right: PAGE.margin,
            },
          },
        },
        children,
      },
    ],
  });
}

export function lessonPlanToDocxBlob(markdown: string): Promise<Blob> {
  return Packer.toBlob(buildLessonPlanDocument(markdown));
}
