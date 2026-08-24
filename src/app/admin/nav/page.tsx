import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, Container, PageHeader, Section } from "@/components/ui";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { ALL_NAV_ITEMS, NAV_GROUPS } from "@/lib/nav";
import { getNavItems } from "@/lib/nav-source";
import type { NavItemRow } from "@/lib/supabase/types";
import { NavEditor, SeedNavDefaults } from "./nav-editor";

export const metadata: Metadata = { title: "탭 메뉴 관리" };

export const dynamic = "force-dynamic";

/** 주소 입력을 도와줄 사이트 내부 경로 목록 */
const HREF_SUGGESTIONS = [...new Set(["/", ...ALL_NAV_ITEMS.map((i) => i.href)])];

/** 탭이 비었을 때 되돌릴 기본 메뉴 */
const DEFAULT_ITEMS = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    group_label: group.label,
    label: item.label,
    href: item.href,
  })),
);

export default async function AdminNavPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/teacher");

  let items: NavItemRow[] = [];
  let loadError: string | null = null;

  try {
    items = await getNavItems();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  return (
    <>
      <PageHeader
        eyebrow="운영자 전용"
        title="탭 메뉴 관리"
        description="왼쪽 세로 메뉴의 탭 이름과 순서를 바꾸고, 탭을 추가하거나 지웁니다. 저장하면 모든 페이지에 바로 반영됩니다."
      />

      <Container>
        {loadError && (
          <div className="mb-8">
            <Alert tone="warning" title="탭 목록을 불러오지 못했습니다">
              {loadError} · supabase/migrations/0004_nav_items.sql 을 적용했는지
              확인해 주세요. 적용 전에는 사이트가 기본 메뉴로 동작합니다.
            </Alert>
          </div>
        )}

        {!loadError && items.length === 0 ? (
          <Section
            title="등록된 탭이 없습니다"
            description="지금은 코드에 있는 기본 메뉴가 보이고 있습니다. 아래 버튼으로 기본 메뉴를 표에 넣으면 편집할 수 있습니다."
          >
            <SeedNavDefaults defaults={DEFAULT_ITEMS} />
          </Section>
        ) : null}

        {items.length > 0 && (
          <Section
            title={`탭 ${items.length}개`}
            description="↑ ↓ 로 순서를 바꾸고, 이름·주소 수정으로 탭 이름과 연결 주소를 고칩니다. 묶음을 바꾸면 그 탭이 해당 묶음으로 옮겨집니다."
          >
            <NavEditor items={items} hrefSuggestions={HREF_SUGGESTIONS} />
          </Section>
        )}

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin" className="font-medium text-brand-700 underline">
            운영자 화면으로
          </Link>
        </div>
      </Container>
    </>
  );
}
