-- =============================================================================
-- 0002 롤백. 0001 직후 상태(= anon 도 호출 가능한 상태)로 되돌린다.
-- 보안 결함이 있는 상태로 되돌리는 것이므로 꼭 필요할 때만 쓴다.
-- =============================================================================

grant execute on function public.increment_rate_limit(text, date, integer)
  to public, anon, authenticated, service_role;
