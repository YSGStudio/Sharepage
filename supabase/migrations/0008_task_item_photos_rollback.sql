-- 0008 되돌리기: 과제 실행 항목 사진 표를 지운다.
-- photos 버킷의 task-items/ 파일은 남으므로 필요하면 Storage 화면에서 직접 지운다.

drop table if exists public.task_item_photos;
