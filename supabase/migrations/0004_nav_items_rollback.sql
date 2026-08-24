-- 0004_nav_items.sql 롤백.
-- 표를 지우면 사이트는 src/lib/nav.ts 의 기본 메뉴로 되돌아간다.

drop trigger if exists nav_items_touch on public.nav_items;
drop table if exists public.nav_items;
drop function if exists public.touch_nav_item();
