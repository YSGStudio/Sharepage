-- =============================================================================
-- 언남초 연구학교 성과공유 웹사이트 — 최초 스키마
--
-- 적용: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 실행.
-- 롤백: supabase/migrations/0001_init_rollback.sql 참고.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 테이블
-- -----------------------------------------------------------------------------

-- 교사 프로필. auth.users 와 1:1.
create table if not exists public.teachers (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  division    text,
  role        text not null default 'teacher' check (role in ('admin', 'teacher')),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

comment on column public.teachers.role is 'admin = 운영자(삭제·승인 권한), teacher = 일반 교사';
comment on column public.teachers.status is 'pending = 승인 대기(교사 전용 기능 사용 불가)';

-- 수업자료
create table if not exists public.teaching_materials (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subject     text not null,
  grade       text not null,
  file_path   text not null,
  file_name   text not null,
  description text,
  uploader_id uuid references public.teachers (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists teaching_materials_created_at_idx
  on public.teaching_materials (created_at desc);

-- 운영 사진
create table if not exists public.photos (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption      text,
  category     text,
  uploader_id  uuid references public.teachers (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists photos_created_at_idx
  on public.photos (created_at desc);

-- 학부모/학생 소감
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  author_type text not null check (author_type in ('student', 'parent')),
  author_name text,
  content     text not null,
  photo_path  text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.teachers (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists testimonials_status_created_at_idx
  on public.testimonials (status, created_at desc);

-- 저장된 지도안 (로그인 교사 개인 작업물)
create table if not exists public.lesson_plans (
  id                   uuid primary key default gen_random_uuid(),
  teacher_id           uuid not null references public.teachers (id) on delete cascade,
  grade                text not null,
  subject              text not null,
  achievement_standard text not null,
  goal                 text not null,
  task                 text not null,
  eval_criteria_top    text not null,
  generated_content    text not null,
  created_at           timestamptz not null default now()
);

create index if not exists lesson_plans_teacher_created_at_idx
  on public.lesson_plans (teacher_id, created_at desc);

-- 지도안 생성 API 일일 호출 카운터 (IP + KST 날짜)
create table if not exists public.api_rate_limits (
  id           uuid primary key default gen_random_uuid(),
  ip_address   text not null,
  request_date date not null,
  count        integer not null default 0,
  updated_at   timestamptz not null default now(),
  unique (ip_address, request_date)
);

-- -----------------------------------------------------------------------------
-- 2. 권한 판정 헬퍼
--    teachers 정책 안에서 teachers 를 다시 조회하면 RLS 무한 재귀가 나므로,
--    security definer 함수로 RLS를 우회해 판정한다.
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teachers t
    where t.id = auth.uid()
      and t.role = 'admin'
      and t.status = 'approved'
  );
$$;

create or replace function public.is_approved_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teachers t
    where t.id = auth.uid()
      and t.status = 'approved'
  );
$$;

-- -----------------------------------------------------------------------------
-- 3. 가입 시 teachers 행 자동 생성 + 권한 상승 방지
-- -----------------------------------------------------------------------------

-- auth.users 에 새 사용자가 생기면 항상 teacher/pending 으로 프로필을 만든다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.teachers (id, name, division, role, status)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), '이름 미입력'),
    nullif(trim(new.raw_user_meta_data ->> 'division'), ''),
    'teacher',   -- 클라이언트가 무엇을 보내든 항상 teacher
    'pending'    -- 항상 승인 대기
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 로그인/익명 사용자가 직접 teachers 에 insert 하더라도 role/status 를 강제한다.
-- service_role 및 SQL Editor(postgres)에서의 운영자 계정 지정은 그대로 통과시킨다.
create or replace function public.force_teacher_defaults()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    new.role := 'teacher';
    new.status := 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists teachers_force_defaults on public.teachers;
create trigger teachers_force_defaults
  before insert on public.teachers
  for each row execute function public.force_teacher_defaults();

-- 일반 사용자가 자기 role/status 를 스스로 바꾸지 못하게 한다.
create or replace function public.protect_teacher_privileges()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists teachers_protect_privileges on public.teachers;
create trigger teachers_protect_privileges
  before update on public.teachers
  for each row execute function public.protect_teacher_privileges();

-- -----------------------------------------------------------------------------
-- 4. 지도안 생성 rate limit (원자적 증가)
--    p_request_date 는 애플리케이션이 KST 기준으로 계산해 넘긴다.
--    날짜가 바뀌면 새 행이 생기므로 별도 초기화 배치가 필요 없다.
-- -----------------------------------------------------------------------------

create or replace function public.increment_rate_limit(
  p_ip_address text,
  p_request_date date,
  p_limit integer
)
returns table (allowed boolean, current_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.api_rate_limits (ip_address, request_date, count, updated_at)
  values (p_ip_address, p_request_date, 1, now())
  on conflict (ip_address, request_date)
  do update set
    count = public.api_rate_limits.count + 1,
    updated_at = now()
  returning count into v_count;

  return query select (v_count <= p_limit), v_count;
end;
$$;

-- PUBLIC 을 반드시 포함해야 한다. 함수는 생성 시 PUBLIC 에 EXECUTE 가 기본 부여되고
-- Supabase 는 public 스키마 함수의 default privileges 도 anon/authenticated 에 준다.
-- 이 둘을 회수하지 않으면 익명 사용자가 임의 IP 의 카운터를 올려
-- 같은 IP 를 쓰는 정상 사용자를 하루 동안 차단시킬 수 있다.
revoke all on function public.increment_rate_limit(text, date, integer)
  from public, anon, authenticated;

grant execute on function public.increment_rate_limit(text, date, integer)
  to service_role;

-- -----------------------------------------------------------------------------
-- 5. RLS
-- -----------------------------------------------------------------------------

alter table public.teachers           enable row level security;
alter table public.teaching_materials enable row level security;
alter table public.photos             enable row level security;
alter table public.testimonials       enable row level security;
alter table public.lesson_plans       enable row level security;
alter table public.api_rate_limits    enable row level security;

-- teachers ---------------------------------------------------------------
drop policy if exists teachers_insert_self on public.teachers;
create policy teachers_insert_self on public.teachers
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists teachers_select_self_or_admin on public.teachers;
create policy teachers_select_self_or_admin on public.teachers
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists teachers_update_admin_only on public.teachers;
create policy teachers_update_admin_only on public.teachers
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists teachers_delete_admin_only on public.teachers;
create policy teachers_delete_admin_only on public.teachers
  for delete to authenticated
  using (public.is_admin());

-- teaching_materials -----------------------------------------------------
drop policy if exists materials_select_public on public.teaching_materials;
create policy materials_select_public on public.teaching_materials
  for select to anon, authenticated
  using (true);

drop policy if exists materials_insert_approved_teacher on public.teaching_materials;
create policy materials_insert_approved_teacher on public.teaching_materials
  for insert to authenticated
  with check (public.is_approved_teacher() and uploader_id = auth.uid());

drop policy if exists materials_delete_admin_only on public.teaching_materials;
create policy materials_delete_admin_only on public.teaching_materials
  for delete to authenticated
  using (public.is_admin());

-- photos -----------------------------------------------------------------
drop policy if exists photos_select_public on public.photos;
create policy photos_select_public on public.photos
  for select to anon, authenticated
  using (true);

drop policy if exists photos_insert_approved_teacher on public.photos;
create policy photos_insert_approved_teacher on public.photos
  for insert to authenticated
  with check (public.is_approved_teacher() and uploader_id = auth.uid());

drop policy if exists photos_delete_admin_only on public.photos;
create policy photos_delete_admin_only on public.photos
  for delete to authenticated
  using (public.is_admin());

-- testimonials -----------------------------------------------------------
drop policy if exists testimonials_insert_anyone on public.testimonials;
create policy testimonials_insert_anyone on public.testimonials
  for insert to anon, authenticated
  with check (status = 'pending' and reviewed_by is null);

drop policy if exists testimonials_select_approved_public on public.testimonials;
create policy testimonials_select_approved_public on public.testimonials
  for select to anon, authenticated
  using (status = 'approved');

drop policy if exists testimonials_select_all_admin on public.testimonials;
create policy testimonials_select_all_admin on public.testimonials
  for select to authenticated
  using (public.is_admin());

drop policy if exists testimonials_update_admin_only on public.testimonials;
create policy testimonials_update_admin_only on public.testimonials
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists testimonials_delete_admin_only on public.testimonials;
create policy testimonials_delete_admin_only on public.testimonials
  for delete to authenticated
  using (public.is_admin());

-- lesson_plans -----------------------------------------------------------
drop policy if exists lesson_plans_select_own on public.lesson_plans;
create policy lesson_plans_select_own on public.lesson_plans
  for select to authenticated
  using (teacher_id = auth.uid());

drop policy if exists lesson_plans_insert_own_approved on public.lesson_plans;
create policy lesson_plans_insert_own_approved on public.lesson_plans
  for insert to authenticated
  with check (teacher_id = auth.uid() and public.is_approved_teacher());

drop policy if exists lesson_plans_delete_own on public.lesson_plans;
create policy lesson_plans_delete_own on public.lesson_plans
  for delete to authenticated
  using (teacher_id = auth.uid());

-- api_rate_limits --------------------------------------------------------
-- 정책을 만들지 않는다. RLS가 켜져 있고 정책이 없으므로 anon/authenticated 는
-- 읽기·쓰기 모두 차단되고, service_role 키를 쓰는 서버만 접근할 수 있다.

-- -----------------------------------------------------------------------------
-- 6. Storage 버킷 및 정책
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- materials 버킷
drop policy if exists materials_object_select_public on storage.objects;
create policy materials_object_select_public on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'materials');

drop policy if exists materials_object_insert_approved on storage.objects;
create policy materials_object_insert_approved on storage.objects
  for insert to authenticated
  with check (bucket_id = 'materials' and public.is_approved_teacher());

drop policy if exists materials_object_delete_admin on storage.objects;
create policy materials_object_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'materials' and public.is_admin());

-- photos 버킷
drop policy if exists photos_object_select_public on storage.objects;
create policy photos_object_select_public on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists photos_object_insert_approved on storage.objects;
create policy photos_object_insert_approved on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and public.is_approved_teacher());

drop policy if exists photos_object_delete_admin on storage.objects;
create policy photos_object_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and public.is_admin());
