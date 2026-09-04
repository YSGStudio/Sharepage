/**
 * pdf.js 실행 자산을 public/vendor/pdfjs/ 로 복사한다.
 *
 * 브릿지 뉴스 업로드 화면은 브라우저에서 PDF 첫 페이지를 그려 썸네일을 만든다.
 * pdf.js 는 워커·CMap·표준 글꼴·wasm 을 같은 출처의 URL 에서 받아가므로,
 * node_modules 의 파일을 정적 자산 폴더로 복사해 둔다.
 *
 * postinstall / prebuild 에서 자동 실행된다. 복사본은 커밋하지 않는다(.gitignore).
 */

import { cpSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** 워커 외에 함께 있어야 화면이 깨지지 않는 자산 폴더 */
const ASSET_DIRS = ["cmaps", "standard_fonts", "wasm", "iccs"];

const destDir = fileURLToPath(new URL("../public/vendor/pdfjs/", import.meta.url));

let pkgDir;
try {
  pkgDir = dirname(createRequire(import.meta.url).resolve("pdfjs-dist/package.json"));
} catch {
  // 의존성 설치 전에 실행될 수 있다. 빌드를 막지 않는다.
  console.warn("[pdfjs] pdfjs-dist 를 찾지 못해 자산 복사를 건너뜁니다.");
  process.exit(0);
}

rmSync(destDir, { recursive: true, force: true });
mkdirSync(destDir, { recursive: true });

cpSync(
  join(pkgDir, "build/pdf.worker.min.mjs"),
  join(destDir, "pdf.worker.min.mjs"),
);
for (const dir of ASSET_DIRS) {
  cpSync(join(pkgDir, dir), join(destDir, dir), { recursive: true });
}

console.log("[pdfjs] public/vendor/pdfjs/ 로 워커·CMap·글꼴·wasm 을 복사했습니다.");
