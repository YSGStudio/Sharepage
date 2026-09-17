-- 0006: 승인된 교사도 게시물(수업자료·사진·브릿지 뉴스)을 삭제할 수 있게 한다.
-- 누가 올렸는지와 관계없이 삭제 가능. 승인 대기·거부 계정과 비로그인은 여전히 막힌다.
-- is_approved_teacher() 는 운영자(approved)도 포함한다.
--
-- 테이블이 없는 프로젝트에서 실행해도 멈추지 않고 건너뛴다.
-- 마지막 조회 결과로 실제 적용 여부를 확인한다.

do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('teaching_materials', 'materials_delete_admin_only',  'materials_delete_approved_teacher'),
      ('photos',             'photos_delete_admin_only',     'photos_delete_approved_teacher'),
      ('bridge_news',        'bridge_news_delete_admin_only','bridge_news_delete_approved_teacher')
    ) as v(tbl, old_policy, new_policy)
  loop
    if to_regclass('public.' || t.tbl) is null then
      raise notice '건너뜀: public.% 테이블이 없습니다', t.tbl;
      continue;
    end if;

    execute format('drop policy if exists %I on public.%I', t.old_policy, t.tbl);
    execute format('drop policy if exists %I on public.%I', t.new_policy, t.tbl);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_approved_teacher())',
      t.new_policy, t.tbl
    );
  end loop;
end $$;

-- Storage ------------------------------------------------------------------
drop policy if exists materials_object_delete_admin on storage.objects;
drop policy if exists materials_object_delete_approved on storage.objects;
create policy materials_object_delete_approved on storage.objects
  for delete to authenticated
  using (bucket_id = 'materials' and public.is_approved_teacher());

drop policy if exists photos_object_delete_admin on storage.objects;
drop policy if exists photos_object_delete_approved on storage.objects;
create policy photos_object_delete_approved on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and public.is_approved_teacher());

drop policy if exists news_object_delete_admin on storage.objects;
drop policy if exists news_object_delete_approved on storage.objects;
create policy news_object_delete_approved on storage.objects
  for delete to authenticated
  using (bucket_id = 'news' and public.is_approved_teacher());

-- 확인: 아래 결과에 *_approved* 정책 6줄이 나오면 모두 적용된 것이다.
select schemaname, tablename, policyname
from pg_policies
where cmd = 'DELETE'
  and tablename in ('teaching_materials', 'photos', 'bridge_news', 'objects')
order by schemaname, tablename, policyname;
