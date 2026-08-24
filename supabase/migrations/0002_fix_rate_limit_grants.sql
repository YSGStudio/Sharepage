-- =============================================================================
-- 0002: increment_rate_limit 함수의 실행 권한을 서버(service_role)로 제한
--
-- 0001 에서는 `revoke all on function ... from anon, authenticated` 만 했는데,
-- Postgres 함수는 생성 시 PUBLIC 에게 EXECUTE 가 기본 부여되고 Supabase 는
-- public 스키마 함수에 대한 default privileges 도 anon/authenticated 에 준다.
-- 그래서 익명 사용자가 RPC 로 직접 호출해 임의 IP 의 카운터를 올릴 수 있었다
-- (같은 IP 를 쓰는 정상 사용자를 하루 동안 차단시킬 수 있는 결함).
--
-- PUBLIC 을 포함해 모두 회수하고 service_role 에만 다시 부여한다.
-- 적용: Supabase SQL Editor 에서 실행. 롤백: 0002_fix_rate_limit_grants_rollback.sql
-- =============================================================================

revoke all on function public.increment_rate_limit(text, date, integer)
  from public, anon, authenticated;

grant execute on function public.increment_rate_limit(text, date, integer)
  to service_role;

-- 확인용: anon 으로 호출하면 42501(permission denied) 이 나야 정상이다.
--   select has_function_privilege('anon',
--     'public.increment_rate_limit(text, date, integer)', 'execute');
--   -> false 여야 한다.
