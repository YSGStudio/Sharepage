-- 0003_timeline_activities.sql 롤백.
-- 등록된 월별 추진활동 카드가 모두 사라진다.

drop trigger if exists timeline_activities_touch on public.timeline_activities;
drop table if exists public.timeline_activities;
drop function if exists public.touch_timeline_activity();
