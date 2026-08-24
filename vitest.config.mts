import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` 는 클라이언트 번들에서 import 되면 던지도록 만들어진 가드다.
      // 테스트는 Node에서 서버 코드를 직접 부르므로 무해한 빈 모듈로 바꾼다.
      "server-only": new URL("./tests/stubs/server-only.ts", import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
  },
});
