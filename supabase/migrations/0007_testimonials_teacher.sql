-- 0007: 소감 작성자 구분에 '교사(teacher)'를 추가한다.
-- 소감 페이지에서 학생·학부모·교사 탭으로 나눠 보여 주기 위함.

alter table public.testimonials
  drop constraint if exists testimonials_author_type_check;

alter table public.testimonials
  add constraint testimonials_author_type_check
  check (author_type in ('student', 'parent', 'teacher'));
