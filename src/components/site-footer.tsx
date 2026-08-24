import Link from "next/link";
import { NAV_GROUPS } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-surface-variant bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-bold text-on-surface">
              서울언남초등학교 연구학교
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              AI·디지털 기반 교육자료 등을 활용한
              <br />
              교수·학습 혁신 및 학생 역량 강화 지원방안
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">2026.3.1. ~ 2027.2.28.</p>
          </div>

          {NAV_GROUPS.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="text-sm font-semibold text-on-surface">{group.label}</p>
              <ul className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-on-surface-variant hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-8 border-t border-outline-variant pt-6 text-xs text-on-surface-variant">
          이 사이트의 연구 소개·모델·조직·추진일정·결과 콘텐츠는 연구학교
          운영계획서와 중간보고서를 바탕으로 작성되었습니다.
        </p>
      </div>
    </footer>
  );
}
