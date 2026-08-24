import type { NavItemRow } from "@/lib/supabase/types";
import { type NavGroup, NAV_GROUPS } from "@/lib/nav";

/**
 * 내비게이션 탭 편집 규칙.
 * API 라우트(검증)와 운영자 화면이 같은 값을 쓰도록 한곳에 모은다.
 */

export const MAX_LABEL_LENGTH = 30;
export const MAX_GROUP_LENGTH = 20;
export const MAX_HREF_LENGTH = 200;

export interface NavItemInput {
  group_label: string;
  label: string;
  href: string;
}

export type NavValidation = { value: NavItemInput } | { error: string };

/**
 * 주소는 사이트 내부 경로(`/about`) 또는 외부 링크(`https://…`)만 받는다.
 * 내부 경로가 실제로 존재하는지는 확인하지 않는다 — 없는 경로는 404 페이지가 뜬다.
 */
export function normalizeHref(raw: unknown): string | null {
  const href = String(raw ?? "").trim();
  if (!href || /\s/.test(href)) return null;
  if (href.length > MAX_HREF_LENGTH) return null;

  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (!href.startsWith("/")) return null;
  // `//evil.example.com` 은 외부로 나가는 주소다. 내부 경로로 받지 않는다.
  if (href.startsWith("//")) return null;

  // 끝의 슬래시를 떼어 `/about` 과 `/about/` 이 다른 탭이 되지 않게 한다.
  return href.length > 1 ? href.replace(/\/+$/, "") : href;
}

export function validateNavItem(raw: unknown): NavValidation {
  const body = (raw ?? {}) as Record<string, unknown>;

  const label = String(body.label ?? "").trim();
  if (!label) return { error: "탭 이름을 입력해 주세요." };
  if (label.length > MAX_LABEL_LENGTH) {
    return { error: `탭 이름은 ${MAX_LABEL_LENGTH}자를 넘을 수 없습니다.` };
  }

  const groupLabel = String(body.group_label ?? "").trim();
  if (!groupLabel) return { error: "묶음 이름을 입력해 주세요." };
  if (groupLabel.length > MAX_GROUP_LENGTH) {
    return { error: `묶음 이름은 ${MAX_GROUP_LENGTH}자를 넘을 수 없습니다.` };
  }

  const href = normalizeHref(body.href);
  if (!href) {
    return {
      error: "주소는 / 로 시작하는 사이트 내부 경로이거나 https:// 링크여야 합니다.",
    };
  }

  return { value: { group_label: groupLabel, label, href } };
}

export interface NavRowGroup {
  label: string;
  items: NavItemRow[];
}

/**
 * 정렬된 탭 목록을 묶음별로 나눈다. 묶음 순서는 그 묶음의 첫 탭 순서를 따르고,
 * 떨어져 있던 같은 묶음의 탭은 먼저 나온 묶음 쪽으로 모인다.
 * 공개 화면과 운영자 화면이 같은 함수를 쓰므로 두 곳의 순서가 항상 같다.
 */
export function groupNavRows(items: NavItemRow[]): NavRowGroup[] {
  const groups: NavRowGroup[] = [];
  const byLabel = new Map<string, NavRowGroup>();

  for (const item of items) {
    let group = byLabel.get(item.group_label);
    if (!group) {
      group = { label: item.group_label, items: [] };
      byLabel.set(item.group_label, group);
      groups.push(group);
    }
    group.items.push(item);
  }

  return groups;
}

/** 정렬된 탭 목록을 화면이 쓰는 묶음 구조로 바꾼다. */
export function toNavGroups(items: NavItemRow[]): NavGroup[] {
  return groupNavRows(items).map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({ href: item.href, label: item.label })),
  }));
}

/** DB 가 비었거나 조회에 실패했을 때 쓰는 기본 메뉴 */
export const FALLBACK_NAV_GROUPS = NAV_GROUPS;
