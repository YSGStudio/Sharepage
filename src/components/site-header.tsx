"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isActivePath, navLinkClass } from "@/components/site-nav";
import type { NavGroup } from "@/lib/nav";

export interface HeaderUser {
  name: string;
  isAdmin: boolean;
  isApproved: boolean;
}

export function SiteHeader({
  user,
  groups,
}: {
  user: HeaderUser | null;
  groups: NavGroup[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (href: string) => navLinkClass(isActivePath(pathname, href));

  return (
    <header className="sticky top-0 z-40 border-b border-surface-variant bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary text-sm font-bold text-white"
          >
            言
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-on-surface sm:text-base">
              서울언남초 연구학교
            </span>
            <span className="block truncate text-[11px] text-on-surface-variant">
              AI·디지털 기반 교수·학습 혁신
            </span>
          </span>
        </Link>

        {/* 주요 메뉴는 왼쪽 세로 내비게이션(SiteSidebar)에 있다. 헤더에는 계정 영역만 둔다. */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <AuthArea user={user} />
        </div>

        {/* 모바일 토글 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="rounded border border-outline-variant px-3 py-2 text-sm font-medium text-primary lg:hidden"
        >
          {open ? "닫기" : "메뉴"}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-surface-variant bg-white lg:hidden">
          <nav
            aria-label="주요 메뉴 (좁은 화면)"
            className="mx-auto max-h-[calc(100vh-8rem)] max-w-7xl overflow-y-auto px-4 py-3 sm:px-6"
          >
            {groups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="px-3 py-1 text-xs font-semibold tracking-wide text-ink-500">
                  {group.label}
                </p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.href}>
                      {/* 이동하면 메뉴를 닫는다 — 같은 링크를 다시 눌러도 닫히도록 클릭에서 처리한다 */}
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={linkClass(item.href)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2 border-t border-surface-variant px-3 pt-3">
              <AuthArea user={user} onNavigate={() => setOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function AuthArea({
  user,
  onNavigate,
}: {
  user: HeaderUser | null;
  onNavigate?: () => void;
}) {
  if (!user) {
    return (
      <>
        <Link
          href="/login"
          onClick={onNavigate}
          className="rounded px-3 py-2 text-sm text-on-surface-variant hover:text-primary"
        >
          교사 로그인
        </Link>
        <Link
          href="/signup"
          onClick={onNavigate}
          className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          가입 신청
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/teacher"
        onClick={onNavigate}
        className="rounded px-3 py-2 text-sm text-on-surface-variant hover:text-primary"
      >
        {user.name}
        {!user.isApproved && (
          <span className="ml-1 rounded bg-accent-100 px-1.5 py-0.5 text-[11px] text-accent-700">
            승인 대기
          </span>
        )}
      </Link>
      {user.isAdmin && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="rounded px-3 py-2 text-sm font-medium text-primary hover:bg-brand-50"
        >
          운영자
        </Link>
      )}
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded border border-outline-variant px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
        >
          로그아웃
        </button>
      </form>
    </>
  );
}
