import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { SiteHeader, type HeaderUser } from "@/components/site-header";
import { SiteSidebar } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser, isAdmin, isApprovedTeacher } from "@/lib/auth";
import { getNavGroups } from "@/lib/nav-source";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "서울언남초등학교 연구학교 | AI·디지털 기반 교수·학습 혁신",
    template: "%s | 서울언남초등학교 연구학교",
  },
  description:
    "서울언남초등학교 연구학교(2026.3~2027.2)의 BRIDGE 교수·학습 모델과 운영 성과를 공유하고, 수업자료·지도안을 함께 나눕니다.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 메뉴는 운영자가 바꿀 수 있다. 표가 없거나 조회에 실패하면 기본 메뉴로 되돌아간다.
  const navGroups = await getNavGroups();

  let headerUser: HeaderUser | null = null;

  // 스키마 적용 전이거나 Supabase 접속이 실패해도 공개 페이지는 떠야 한다.
  try {
    const user = await getCurrentUser();
    if (user) {
      headerUser = {
        name: user.teacher?.name ?? user.email ?? "교사",
        isAdmin: isAdmin(user),
        isApproved: isApprovedTeacher(user),
      };
    }
  } catch {
    headerUser = null;
  }

  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} flex min-h-screen flex-col antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <SiteHeader user={headerUser} groups={navGroups} />
        <div className="flex flex-1 items-start">
          <SiteSidebar groups={navGroups} />
          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
        </div>
        <SiteFooter groups={navGroups} />
      </body>
    </html>
  );
}
