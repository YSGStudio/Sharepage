import type { HwpDocument } from "@rhwp/core";
import { lessonPlanToHtmlBlocks } from "./export-html";

/** public/ 로 복사해 둔 rhwp WASM 경로 (scripts/copy-rhwp-wasm.mjs) */
export const RHWP_WASM_URL = "/vendor/rhwp/rhwp_bg.wasm";

type HwpDocumentClass = Pick<typeof HwpDocument, "createEmpty">;

/**
 * 지도안 마크다운을 한글 5.0 바이너리(.hwp)로 만든다.
 *
 * rhwp 의 pasteHtml 은 "문단 + 표 + 문단" 을 한 번에 붙이면 패닉이 나고,
 * 표 뒤에서 문단을 나누면 표가 밀려나 사라진다. 그래서 블록 수만큼 빈 문단을
 * 먼저 만들고, 뒤에서부터 하나씩 채운다(앞쪽 문단 번호가 밀리지 않는다).
 * 빈 문단에 붙이므로 앞 블록의 굵게·들여쓰기가 다음 블록으로 번지지도 않는다.
 */
export function buildLessonPlanHwp(
  Doc: HwpDocumentClass,
  markdown: string,
): Uint8Array {
  // 수평선은 한글로 옮길 방법이 없고, 빈 HTML 은 pasteHtml 이 거부한다.
  const blocks = lessonPlanToHtmlBlocks(markdown).filter((b) => b !== "<hr>");

  const doc = Doc.createEmpty();
  try {
    doc.createBlankDocument();
    for (let i = 1; i < blocks.length; i++) doc.splitParagraph(0, 0, 0);

    for (let i = blocks.length - 1; i >= 0; i--) {
      const result = JSON.parse(doc.pasteHtml(0, i, 0, blocks[i])) as {
        ok: boolean;
        error?: string;
      };
      if (!result.ok) {
        throw new Error(`한글 문서 변환 실패: ${result.error ?? "알 수 없는 오류"}`);
      }
    }

    return doc.exportHwp();
  } finally {
    doc.free();
  }
}

let ready: Promise<typeof import("@rhwp/core")> | null = null;

/** WASM(약 10MB)은 처음 내보낼 때만 받는다. */
function loadRhwp() {
  ready ??= (async () => {
    const rhwp = await import("@rhwp/core");

    // 조판(줄 나눔)에 쓰는 글자 폭 측정기. rhwp 가 전역에서 찾는다.
    const ctx = document.createElement("canvas").getContext("2d");
    (globalThis as { measureTextWidth?: (font: string, text: string) => number })
      .measureTextWidth = (font, text) => {
      if (!ctx) return text.length * 10;
      ctx.font = font;
      return ctx.measureText(text).width;
    };

    await rhwp.default({ module_or_path: RHWP_WASM_URL });
    return rhwp;
  })().catch((error) => {
    ready = null; // 네트워크 오류 뒤 다시 시도할 수 있게 한다.
    throw error;
  });
  return ready;
}

export async function lessonPlanToHwpBlob(markdown: string): Promise<Blob> {
  const { HwpDocument } = await loadRhwp();
  const bytes = buildLessonPlanHwp(HwpDocument, markdown);
  return new Blob([bytes as BlobPart], { type: "application/x-hwp" });
}
