-- 0009_photo_caption_update.sql 롤백: 사진 수정 정책을 지운다(아무도 수정할 수 없던 상태로 돌아간다).

drop policy if exists photos_update_approved_teacher on public.photos;
