-- 0007 되돌리기: 작성자 구분을 학생·학부모로 되돌린다.
-- 교사 소감이 남아 있으면 제약을 다시 걸 수 없으므로 먼저 지운다.

delete from public.testimonials where author_type = 'teacher';

alter table public.testimonials
  drop constraint if exists testimonials_author_type_check;

alter table public.testimonials
  add constraint testimonials_author_type_check
  check (author_type in ('student', 'parent'));
