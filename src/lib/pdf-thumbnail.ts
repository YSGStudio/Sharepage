/**
 * PDF 첫 페이지를 표지 이미지로 만든다 (브라우저 전용).
 *
 * 서버에서 PDF 를 그리려면 네이티브 canvas 가 필요해 배포가 무거워진다.
 * 업로드하는 사람의 브라우저에 이미 canvas 가 있으므로, 첫 페이지를 여기서 그려
 * PDF 와 함께 올린다. 실패하면 표지 없이 등록되도록 호출하는 쪽에서 처리한다.
 *
 * pdf.js 는 워커·CMap·표준 글꼴·wasm 을 같은 출처 URL 에서 받는다.
 * 이 파일들은 scripts/copy-pdf-worker.mjs 가 public/vendor/pdfjs/ 로 복사해 둔다.
 */

/** public/vendor/pdfjs/ — scripts/copy-pdf-worker.mjs 가 채운다 */
const ASSET_BASE = "/vendor/pdfjs/";

/** 목록 카드가 커야 300px 남짓이라 그 두 배로 그린다. */
const MAX_WIDTH = 800;

export const THUMB_MIME = "image/jpeg";
export const THUMB_EXTENSION = "jpg";

/**
 * 첫 페이지를 JPEG 로 그려 돌려준다.
 * PDF 를 열 수 없거나 캔버스를 쓸 수 없으면 예외를 던진다.
 */
export async function renderPdfCover(file: File): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `${ASSET_BASE}pdf.worker.min.mjs`;

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: `${ASSET_BASE}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${ASSET_BASE}standard_fonts/`,
    wasmUrl: `${ASSET_BASE}wasm/`,
    iccUrl: `${ASSET_BASE}iccs/`,
  });

  try {
    const doc = await loadingTask.promise;
    const page = await doc.getPage(1);
    const unscaled = page.getViewport({ scale: 1 });
    // 세로가 아주 긴 페이지에서도 캔버스가 지나치게 커지지 않도록 배율을 묶는다.
    const viewport = page.getViewport({
      scale: Math.min(MAX_WIDTH / unscaled.width, 3),
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvas, viewport }).promise;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, THUMB_MIME, 0.82);
    });
    if (!blob) throw new Error("표지 이미지를 만들지 못했습니다.");
    return blob;
  } finally {
    // 워커가 메모리를 붙들고 있지 않도록 항상 닫는다.
    await loadingTask.destroy();
  }
}
