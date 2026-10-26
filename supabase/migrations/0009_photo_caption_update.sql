-- 0009: 승인된 교사도 앨범 사진의 캡션을 수정할 수 있게 한다.
-- 누가 올렸는지와 관계없이 수정 가능. 승인 대기·거부 계정과 비로그인은 여전히 막힌다.
-- is_approved_teacher() 는 운영자(approved)도 포함한다.
--
-- 이 정책이 없으면 RLS 가 update 를 오류 없이 0행으로 걸러 내서
-- PATCH /api/photos/[id] 가 "사진을 찾을 수 없습니다"(404)를 돌려준다.

drop policy if exists photos_update_approved_teacher on public.photos;
create policy photos_update_approved_teacher on public.photos
  for update to authenticated
  using (public.is_approved_teacher())
  with check (public.is_approved_teacher());

-- 확인: 아래 결과에 photos_update_approved_teacher 1줄이 나오면 적용된 것이다.
select schemaname, tablename, policyname
from pg_policies
where cmd = 'UPDATE'
  and tablename = 'photos'
order by policyname;
