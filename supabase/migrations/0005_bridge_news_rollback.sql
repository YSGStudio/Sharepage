-- 0005_bridge_news.sql 롤백.
-- 버킷의 파일은 남는다. 필요하면 Storage 화면에서 news 버킷을 직접 비운다.

delete from public.nav_items where href = '/news';

drop policy if exists news_object_select_public on storage.objects;
drop policy if exists news_object_insert_approved on storage.objects;
drop policy if exists news_object_delete_admin on storage.objects;

drop table if exists public.bridge_news;
