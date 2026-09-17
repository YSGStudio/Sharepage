-- 0006_teacher_delete_posts.sql 롤백: 게시물 삭제를 다시 운영자 전용으로 되돌린다.

drop policy if exists materials_delete_approved_teacher on public.teaching_materials;
drop policy if exists materials_delete_admin_only on public.teaching_materials;
create policy materials_delete_admin_only on public.teaching_materials
  for delete to authenticated
  using (public.is_admin());

drop policy if exists photos_delete_approved_teacher on public.photos;
drop policy if exists photos_delete_admin_only on public.photos;
create policy photos_delete_admin_only on public.photos
  for delete to authenticated
  using (public.is_admin());

drop policy if exists bridge_news_delete_approved_teacher on public.bridge_news;
drop policy if exists bridge_news_delete_admin_only on public.bridge_news;
create policy bridge_news_delete_admin_only on public.bridge_news
  for delete to authenticated
  using (public.is_admin());

drop policy if exists materials_object_delete_approved on storage.objects;
drop policy if exists materials_object_delete_admin on storage.objects;
create policy materials_object_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'materials' and public.is_admin());

drop policy if exists photos_object_delete_approved on storage.objects;
drop policy if exists photos_object_delete_admin on storage.objects;
create policy photos_object_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and public.is_admin());

drop policy if exists news_object_delete_approved on storage.objects;
drop policy if exists news_object_delete_admin on storage.objects;
create policy news_object_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'news' and public.is_admin());
