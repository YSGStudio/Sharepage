-- =============================================================================
-- 내비게이션 탭 — 운영자가 이름·순서·구성을 직접 관리한다.
--
-- 적용: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- 롤백: supabase/migrations/0004_nav_items_rollback.sql 참고.
-- =============================================================================

create table if not exists public.nav_items (
  id           uuid primary key default gen_random_uuid(),
  group_label  text not null check (char_length(trim(group_label)) between 1 and 20),
  label        text not null check (char_length(trim(label)) between 1 and 30),
  href         text not null unique check (char_length(href) between 1 and 200),
  sort_order   integer not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.nav_items is '왼쪽 세로 내비게이션 탭. 비어 있거나 조회에 실패하면 src/lib/nav.ts 의 기본 목록을 쓴다.';
comment on column public.nav_items.group_label is '탭 묶음 이름. 같은 이름끼리 한 묶음으로 그려진다.';
comment on column public.nav_items.sort_order is '전체 순서. 작을수록 위. 묶음 순서도 이 값으로 정해진다.';

create index if not exists nav_items_sort_order_idx
  on public.nav_items (sort_order, created_at);

-- updated_at 자동 갱신 (0003 과 얽히지 않도록 자체 함수를 둔다)
create or replace function public.touch_nav_item()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists nav_items_touch on public.nav_items;
create trigger nav_items_touch
  before update on public.nav_items
  for each row execute function public.touch_nav_item();

-- -----------------------------------------------------------------------------
-- 기본 탭 채우기 — 0004 적용 직후에도 지금과 같은 메뉴가 보이도록 한다.
-- href 가 unique 이므로 다시 실행해도 중복되지 않는다.
-- -----------------------------------------------------------------------------

insert into public.nav_items (group_label, label, href, sort_order)
values
  ('연구 소개', '연구 핵심소개',          '/about',            10),
  ('연구 소개', '교원별 역할',            '/roles',            20),
  ('연구 소개', '월별 추진현황',          '/timeline',         30),
  ('연구 과제', '과제1',                  '/tasks/common-1',   40),
  ('연구 과제', '과제2',                  '/tasks/common-2',   50),
  ('연구 과제', '과제3',                  '/tasks/common-3',   60),
  ('연구 과제', '선택1',                  '/tasks/option-1',   70),
  ('연구 과제', '선택2',                  '/tasks/option-2',   80),
  ('모델·결과', 'BRIDGE 모델',            '/model',            90),
  ('모델·결과', '연구 결과',              '/results',         100),
  ('자료 나눔', '수업자료',               '/materials',       110),
  ('자료 나눔', '운영 사진',              '/gallery',         120),
  ('자료 나눔', '학부모·학생 소감',       '/testimonials',    130),
  ('도구',      'BRIDGE 지도안 만들기',   '/lesson-plan',     140)
on conflict (href) do nothing;

-- -----------------------------------------------------------------------------
-- RLS — 읽기는 전체 공개, 쓰기는 운영자만
-- -----------------------------------------------------------------------------

alter table public.nav_items enable row level security;

drop policy if exists nav_items_select_public on public.nav_items;
create policy nav_items_select_public on public.nav_items
  for select to anon, authenticated
  using (true);

drop policy if exists nav_items_insert_admin on public.nav_items;
create policy nav_items_insert_admin on public.nav_items
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists nav_items_update_admin on public.nav_items;
create policy nav_items_update_admin on public.nav_items
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists nav_items_delete_admin on public.nav_items;
create policy nav_items_delete_admin on public.nav_items
  for delete to authenticated
  using (public.is_admin());
