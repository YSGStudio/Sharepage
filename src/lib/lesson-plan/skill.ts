import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * elementary-lesson-plan 스킬 문서를 읽어 온다 (지도안 생성 프롬프트의 원본).
 *
 * 문서를 TS 문자열로 베껴 두면 스킬이 바뀔 때마다 두 곳을 고쳐야 하므로,
 * `src/content/lesson-plan/` 의 마크다운을 그대로 읽어 쓴다.
 * 스킬이 갱신되면 이 폴더의 .md 세 개만 교체하면 된다.
 *
 * 서버에서만 쓴다. 배포 번들에 파일이 함께 실리도록
 * next.config.ts 의 outputFileTracingIncludes 에 이 폴더를 넣어 두었다.
 */

const DOC_DIR = join(process.cwd(), "src", "content", "lesson-plan");

/** 스킬을 고를 때 쓰는 정보라 프롬프트에는 넣지 않는다. */
function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

function readDoc(name: string): string {
  return stripFrontmatter(readFileSync(join(DOC_DIR, name), "utf8"));
}

/** 작성 절차·BRIDGE 3단계 정의·금지 규칙 */
export const SKILL_DOC = readDoc("SKILL.md");

/** 칸별 작성 규칙과 분량 기준 */
export const FORMAT_SPEC_DOC = readDoc("format-spec.md");

/** 도구 목록·주도성 서술 패턴·단계별 상용 문형 */
export const PHRASEBANK_DOC = readDoc("phrasebank.md");
