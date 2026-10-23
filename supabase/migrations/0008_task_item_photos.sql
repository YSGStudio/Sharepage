-- =============================================================================
-- 과제 실행 항목 사진 — 과제 페이지(/tasks/*) 실행 내용 도식의 세부 항목마다 사진 1장.
-- 기본 사진은 코드(src/content/research.ts)에 있고, 운영자가 바꾼 항목만 여기에 행이 생긴다.
-- 파일은 기존 photos 버킷의 task-items/ 폴더에 둔다.
--
-- 적용: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- 롤백: supabase/migrations/0008_task_item_photos_rollback.sql 참고.
-- =============================================================================

create table if not exists public.task_item_photos (
  item_key      text primary key check (item_key ~ '^[a-z]+-[0-9]+-[0-9]+-[0-9]+$'),
  storage_path  text not null,
  updated_by    uuid references auth.users (id) on delete set null,
  updated_at    timestamptz not null default now()
);

comment on table public.task_item_photos is '과제 실행 항목별로 운영자가 바꾼 사진. 행이 없으면 코드의 기본 사진을 쓴다.';
comment on column public.task_item_photos.item_key is '과제id-가나다순번-세부항목순번. 예: common-1-2-1';

-- -----------------------------------------------------------------------------
-- RLS — 읽기는 전체 공개, 쓰기는 운영자만
-- -----------------------------------------------------------------------------

alter table public.task_item_photos enable row level security;

drop policy if exists task_item_photos_select_public on public.task_item_photos;
create policy task_item_photos_select_public on public.task_item_photos
  for select to anon, authenticated
  using (true);

drop policy if exists task_item_photos_insert_admin on public.task_item_photos;
create policy task_item_photos_insert_admin on public.task_item_photos
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists task_item_photos_update_admin on public.task_item_photos;
create policy task_item_photos_update_admin on public.task_item_photos
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists task_item_photos_delete_admin on public.task_item_photos;
create policy task_item_photos_delete_admin on public.task_item_photos
  for delete to authenticated
  using (public.is_admin());
