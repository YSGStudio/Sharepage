-- =============================================================================
-- 0001_init.sql 롤백
-- 주의: 테이블을 지우므로 저장된 자료·소감·지도안이 모두 사라진다.
-- =============================================================================

-- Storage 정책
drop policy if exists materials_object_select_public on storage.objects;
drop policy if exists materials_object_insert_approved on storage.objects;
drop policy if exists materials_object_delete_admin on storage.objects;
drop policy if exists photos_object_select_public on storage.objects;
drop policy if exists photos_object_insert_approved on storage.objects;
drop policy if exists photos_object_delete_admin on storage.objects;

-- 버킷 (내부 파일이 남아 있으면 먼저 비워야 한다)
delete from storage.objects where bucket_id in ('materials', 'photos');
delete from storage.buckets where id in ('materials', 'photos');

-- 트리거
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists teachers_force_defaults on public.teachers;
drop trigger if exists teachers_protect_privileges on public.teachers;

-- 함수
drop function if exists public.handle_new_user();
drop function if exists public.force_teacher_defaults();
drop function if exists public.protect_teacher_privileges();
drop function if exists public.increment_rate_limit(text, date, integer);
drop function if exists public.is_admin();
drop function if exists public.is_approved_teacher();

-- 테이블 (FK 의존 순서)
drop table if exists public.api_rate_limits;
drop table if exists public.lesson_plans;
drop table if exists public.testimonials;
drop table if exists public.photos;
drop table if exists public.teaching_materials;
drop table if exists public.teachers;
