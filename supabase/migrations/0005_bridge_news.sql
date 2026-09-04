-- =============================================================================
-- 브릿지 뉴스 — 자료 나눔 탭의 소식지(PDF) 게시판.
--
-- 첫 페이지 썸네일은 업로드 화면(브라우저)에서 만들어 함께 올린다.
-- 썸네일 생성에 실패해도 PDF 등록은 되도록 thumb_path 는 nullable 이다.
--
-- 적용: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- 롤백: supabase/migrations/0005_bridge_news_rollback.sql 참고.
-- =============================================================================

create table if not exists public.bridge_news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(trim(title)) between 1 and 120),
  issue_label  text check (char_length(trim(issue_label)) between 1 and 30),
  published_on date,
  description  text,
  file_path    text not null,
  file_name    text not null,
  thumb_path   text,
  uploader_id  uuid references public.teachers (id) on delete set null,
  created_at   timestamptz not null default now()
);

comment on table public.bridge_news is '브릿지 뉴스 소식지. 본문은 PDF 파일 하나로 관리한다.';
comment on column public.bridge_news.issue_label is '호수 표기(예: 제3호). 비워 둘 수 있다.';
comment on column public.bridge_news.published_on is '발행일. 목록은 발행일 → 등록일 순으로 정렬한다.';
comment on column public.bridge_news.thumb_path is 'PDF 첫 페이지를 그린 표지 이미지 경로. 없으면 목록에서 기본 표지를 보여 준다.';

create index if not exists bridge_news_published_idx
  on public.bridge_news (published_on desc nulls last, created_at desc);

-- -----------------------------------------------------------------------------
-- RLS — 읽기는 전체 공개, 등록은 승인 교사, 삭제는 운영자
-- -----------------------------------------------------------------------------

alter table public.bridge_news enable row level security;

drop policy if exists bridge_news_select_public on public.bridge_news;
create policy bridge_news_select_public on public.bridge_news
  for select to anon, authenticated
  using (true);

drop policy if exists bridge_news_insert_approved_teacher on public.bridge_news;
create policy bridge_news_insert_approved_teacher on public.bridge_news
  for insert to authenticated
  with check (public.is_approved_teacher() and uploader_id = auth.uid());

drop policy if exists bridge_news_delete_admin_only on public.bridge_news;
create policy bridge_news_delete_admin_only on public.bridge_news
  for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage 버킷 — PDF 와 표지 이미지를 같은 공개 버킷에 둔다.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('news', 'news', true)
on conflict (id) do update set public = true;

drop policy if exists news_object_select_public on storage.objects;
create policy news_object_select_public on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'news');

drop policy if exists news_object_insert_approved on storage.objects;
create policy news_object_insert_approved on storage.objects
  for insert to authenticated
  with check (bucket_id = 'news' and public.is_approved_teacher());

drop policy if exists news_object_delete_admin on storage.objects;
create policy news_object_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'news' and public.is_admin());

-- -----------------------------------------------------------------------------
-- 내비게이션 탭 추가 — '자료 나눔' 묶음의 수업자료(110)와 운영 사진(120) 사이.
-- nav_items 가 비어 있으면 src/lib/nav.ts 의 기본 메뉴가 쓰이므로 그쪽도 함께 고쳐 두었다.
-- -----------------------------------------------------------------------------

insert into public.nav_items (group_label, label, href, sort_order)
values ('자료 나눔', '브릿지 뉴스', '/news', 115)
on conflict (href) do nothing;
