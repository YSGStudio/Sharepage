"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup } from "@/lib/nav";

/**
 * 링크 하나의 상태별 모양. 세로 내비게이션(왼쪽 사이드바)과
 * 좁은 화면의 펼침 메뉴가 같은 모양을 쓴다.
 */
export function navLinkClass(active: boolean): string {
  return [
    "relative flex min-h-10 items-center rounded-xl px-3 py-2 text-[15px] leading-6 transition-all duration-200",
    active
      ? "bg-brand-50 pl-4 font-bold text-primary shadow-[inset_0_0_0_1px_rgba(0,63,177,0.08)] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary"
      : "font-medium text-on-surface-variant hover:translate-x-0.5 hover:bg-white/80 hover:text-primary",
  ].join(" ");
}

const groupStyles = [
  "bg-brand-50 text-brand-700 ring-brand-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
] as const;

/** 현재 경로가 그 메뉴에 속하는지. 하위 경로(/tasks/common-1 등)까지 포함한다. */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 왼쪽 세로 내비게이션. lg 이상에서만 보이고,
 * 좁은 화면에서는 헤더의 펼침 메뉴가 같은 목록을 보여준다.
 */
export function SiteSidebar({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-brand-100 bg-gradient-to-b from-brand-50/70 via-white to-emerald-50/30 lg:block">
      <nav aria-label="주요 메뉴" className="px-4 py-6">
        <div className="mb-6 px-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Research School
          </p>
          <p className="mt-1 text-base font-bold text-on-surface">연구학교 둘러보기</p>
        </div>

        <div className="space-y-5">
          {groups.map((group, groupIndex) => (
            <section key={group.label} aria-labelledby={`nav-group-${groupIndex}`}>
              <div className="mb-1.5 flex items-center gap-2 px-2">
                <span
                  aria-hidden
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold ring-1 ${groupStyles[groupIndex % groupStyles.length]}`}
                >
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                <h2
                  id={`nav-group-${groupIndex}`}
                  className="text-xs font-bold tracking-wide text-ink-700"
                >
                  {group.label}
                </h2>
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={
                        isActivePath(pathname, item.href) ? "page" : undefined
                      }
                      className={navLinkClass(isActivePath(pathname, item.href))}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </nav>
    </aside>
  );
}
