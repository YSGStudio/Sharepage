/**
 * 운영 사진(앨범) 섹션 구분.
 *
 * 큰 섹션 = 연구 과제 5개(공통3·선택2), 작은 섹션 = 각 과제의 주요 추진 내용.
 * 모두 `RESEARCH_TASKS`에서 파생하므로 과제 내용이 바뀌면 앨범 구분도 함께 바뀐다.
 *
 * 사진의 소속은 photos.category 컬럼에 `과제id:추진내용번호` 형태의 **섹션 키**로
 * 저장한다(예: "common-1:2"). 별도 컬럼을 두지 않아 마이그레이션이 필요 없고,
 * 키와 맞지 않는 기존 값(예: "수업 나눔")은 '미분류'로 모인다.
 */

import { RESEARCH_TASKS, taskLabel } from "@/content/research";

export interface GallerySubsection {
  /** photos.category 에 저장되는 값 */
  key: string;
  /** 주요 추진 내용 이름 (설명 앞부분) */
  title: string;
  /** 콜론 뒤 상세 설명. 없으면 null */
  detail: string | null;
}

export interface GallerySection {
  taskId: string;
  kind: "공통과제" | "선택과제";
  /** 과제1 · 선택1 같은 짧은 번호 이름 */
  label: string;
  title: string;
  subsections: GallerySubsection[];
}

/** 키와 맞지 않는 사진을 모으는 자리 */
export const UNSORTED_KEY = "unsorted";

/** "이름: 설명" 형태의 추진 내용을 이름과 설명으로 나눈다. */
function splitStrategy(strategy: string): { title: string; detail: string | null } {
  const at = strategy.indexOf(": ");
  if (at < 0) return { title: strategy, detail: null };
  return {
    title: strategy.slice(0, at),
    detail: strategy.slice(at + 2),
  };
}

export const GALLERY_SECTIONS: GallerySection[] = RESEARCH_TASKS.map((task) => ({
  taskId: task.id,
  kind: task.kind,
  label: taskLabel(task),
  title: task.title,
  subsections: task.strategies.map((strategy, index) => ({
    key: `${task.id}:${index + 1}`,
    ...splitStrategy(strategy),
  })),
}));

/** 업로드 폼·API 검증에서 쓰는 유효한 섹션 키 전체 */
export const GALLERY_SECTION_KEYS: string[] = GALLERY_SECTIONS.flatMap((s) =>
  s.subsections.map((sub) => sub.key),
);

export function isGallerySectionKey(value: string): boolean {
  return GALLERY_SECTION_KEYS.includes(value);
}
