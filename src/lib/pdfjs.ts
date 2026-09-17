/**
 * pdf.js 공통 설정 (브라우저 전용).
 *
 * pdf.js 는 워커·CMap·표준 글꼴·wasm 을 같은 출처 URL 에서 받는다.
 * 이 파일들은 scripts/copy-pdf-worker.mjs 가 public/vendor/pdfjs/ 로 복사해 둔다.
 */

const ASSET_BASE = "/vendor/pdfjs/";

/** getDocument 에 함께 넘기는 자산 경로 */
export const PDFJS_ASSET_OPTIONS = {
  cMapUrl: `${ASSET_BASE}cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${ASSET_BASE}standard_fonts/`,
  wasmUrl: `${ASSET_BASE}wasm/`,
  iccUrl: `${ASSET_BASE}iccs/`,
};

/** pdf.js 를 필요할 때만 불러오고 워커 경로를 맞춘다. */
export async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `${ASSET_BASE}pdf.worker.min.mjs`;
  return pdfjs;
}
