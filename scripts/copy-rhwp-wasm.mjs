/**
 * rhwp WASM 을 public/vendor/rhwp/ 로 복사한다.
 *
 * 지도안을 한글(.hwp)로 내보낼 때 브라우저가 이 WASM 으로 문서를 만든다.
 * 번들러에 맡기지 않고 같은 출처의 고정 URL 에서 받게 해, 처음 내보낼 때만 내려받는다.
 *
 * postinstall / prebuild 에서 자동 실행된다. 복사본은 커밋하지 않는다(.gitignore).
 */

import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const destDir = fileURLToPath(new URL("../public/vendor/rhwp/", import.meta.url));

let pkgDir;
try {
  pkgDir = dirname(createRequire(import.meta.url).resolve("@rhwp/core/package.json"));
} catch {
  // 의존성 설치 전에 실행될 수 있다. 빌드를 막지 않는다.
  console.warn("[rhwp] @rhwp/core 를 찾지 못해 WASM 복사를 건너뜁니다.");
  process.exit(0);
}

rmSync(destDir, { recursive: true, force: true });
mkdirSync(destDir, { recursive: true });
copyFileSync(join(pkgDir, "rhwp_bg.wasm"), join(destDir, "rhwp_bg.wasm"));

console.log("[rhwp] public/vendor/rhwp/ 로 WASM 을 복사했습니다.");
