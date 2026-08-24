-- =============================================================================
-- 월별 추진활동 (운영자가 직접 등록·관리하는 카드)
--
-- 적용: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- 롤백: supabase/migrations/0003_timeline_activities_rollback.sql 참고.
-- =============================================================================

create table if not exists public.timeline_activities (
  id          uuid primary key default gen_random_uuid(),
  year        smallint not null check (year between 2000 and 2100),
  month       smallint not null check (month between 1 and 12),
  title       text not null check (char_length(trim(title)) between 1 and 120),
  assignees   text[] not null default '{}',
  status      text not null default 'not_started'
                check (status in ('not_started', 'in_progress', 'done')),
  note        text,
  sort_order  integer not null default 0,
  created_by  uuid references public.teachers (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.timeline_activities is '월별 추진활동 보드. 운영자만 쓰기, 공개 페이지에서 누구나 읽기.';
comment on column public.timeline_activities.assignees is '담당자 이름 목록. teachers 와 연결하지 않고 표시용 텍스트로 둔다.';
comment on column public.timeline_activities.sort_order is '같은 달 안에서의 카드 순서. 작을수록 위.';

-- 공개 페이지는 (year, month) 로 묶어 순서대로 읽는다.
create index if not exists timeline_activities_period_idx
  on public.timeline_activities (year, month, sort_order, created_at);

-- updated_at 자동 갱신
create or replace function public.touch_timeline_activity()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists timeline_activities_touch on public.timeline_activities;
create trigger timeline_activities_touch
  before update on public.timeline_activities
  for each row execute function public.touch_timeline_activity();

-- -----------------------------------------------------------------------------
-- RLS — 읽기는 전체 공개, 쓰기는 운영자만 (R16, R17 과 같은 기준)
-- -----------------------------------------------------------------------------

alter table public.timeline_activities enable row level security;

drop policy if exists timeline_activities_select_public on public.timeline_activities;
create policy timeline_activities_select_public on public.timeline_activities
  for select to anon, authenticated
  using (true);

drop policy if exists timeline_activities_insert_admin on public.timeline_activities;
create policy timeline_activities_insert_admin on public.timeline_activities
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists timeline_activities_update_admin on public.timeline_activities;
create policy timeline_activities_update_admin on public.timeline_activities
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists timeline_activities_delete_admin on public.timeline_activities;
create policy timeline_activities_delete_admin on public.timeline_activities
  for delete to authenticated
  using (public.is_admin());
