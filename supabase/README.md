# Supabase 설정 가이드

## 1. 마이그레이션 적용

Supabase 대시보드 → **SQL Editor** → **New query** 에
`migrations/0001_init.sql` 전체 내용을 붙여넣고 **Run**.

성공하면 다음이 만들어진다:

- 테이블 6개: `teachers`, `teaching_materials`, `photos`, `testimonials`, `lesson_plans`, `api_rate_limits`
- Storage 버킷 2개: `materials`, `photos` (공개 읽기)
- RLS 정책 및 권한 판정 함수 `is_admin()`, `is_approved_teacher()`
- 가입 시 `teachers` 행을 `role='teacher'`, `status='pending'` 으로 강제 생성하는 트리거

되돌리려면 `migrations/0001_init_rollback.sql` 을 같은 방식으로 실행한다.

이후 마이그레이션도 같은 방법으로 번호 순서대로 실행한다.

| 파일 | 내용 |
| --- | --- |
| `migrations/0002_fix_rate_limit_grants.sql` | 지도안 rate limit 함수 권한 정리 |
| `migrations/0003_timeline_activities.sql` | 월별 추진활동 테이블 `timeline_activities` (읽기 공개, 쓰기 운영자 전용) |
| `migrations/0004_nav_items.sql` | 탭 메뉴 테이블 `nav_items` (읽기 공개, 쓰기 운영자 전용). 현재 메뉴 14개를 기본값으로 함께 넣는다 |
| `migrations/0005_bridge_news.sql` | 브릿지 뉴스 테이블 `bridge_news` + Storage 버킷 `news` (읽기 공개, 등록은 승인 교사, 삭제는 운영자). `nav_items` 에 '브릿지 뉴스' 탭도 함께 넣는다 |
| `migrations/0006_teacher_delete_posts.sql` | 수업자료·사진·브릿지 뉴스 삭제를 운영자 전용에서 **승인된 교사 전체**로 넓힌다 (누가 올렸든 삭제 가능) |

`0003` 을 실행하기 전에는 `/timeline` 이 `src/content/timeline.ts` 의 기본 계획만
보여주고, 운영자 화면(`/admin/timeline`)에서 등록을 시도하면 오류가 난다.

`0004` 를 실행하기 전에는 왼쪽 세로 메뉴가 `src/lib/nav.ts` 의 기본 목록으로
동작하고, 운영자 화면(`/admin/nav`)에서 편집할 수 없다. 표가 비어 있으면
`/admin/nav` 의 "기본 메뉴 가져오기" 버튼으로 다시 채울 수 있다.

`0005` 를 실행하기 전에는 `/news` 가 "소식지를 불러오지 못했습니다" 안내만 보여주고
업로드가 실패한다. `nav_items` 를 이미 쓰고 있다면 `0005` 실행 후 왼쪽 메뉴에
'브릿지 뉴스' 탭이 생긴다 (순서·이름은 `/admin/nav` 에서 바꿀 수 있다).

`0006` 을 실행하기 전에는 일반 교사 화면에 삭제 버튼이 보여도 DB 정책(RLS)이
막아 실제로는 지워지지 않는다. 코드 배포와 함께 꼭 실행한다.

> 탭을 지워도 그 페이지 자체가 사라지는 것은 아니다. 메뉴에서만 빠지고
> 주소로는 계속 들어갈 수 있다.

## 2. 운영자(admin) 계정 만들기

운영자 계정은 사이트 UI로 만들지 않는다. 다음 순서로 지정한다.

1. 사이트의 회원가입 폼(`/signup`)에서 운영자로 쓸 이메일로 가입한다.
   (또는 대시보드 **Authentication → Users → Add user** 로 생성)
   이 시점에는 `role='teacher'`, `status='pending'` 이다.
2. SQL Editor 에서 아래를 실행해 운영자로 승격한다.

```sql
update public.teachers
set role = 'admin', status = 'approved'
where id = (select id from auth.users where email = '운영자이메일@example.com');
```

3. 결과 확인:

```sql
select t.id, u.email, t.name, t.role, t.status
from public.teachers t
join auth.users u on u.id = t.id
order by t.created_at;
```

> `teachers` 의 `role`/`status` 는 트리거로 보호된다. 로그인 사용자가 보내는
> 요청으로는 절대 바꿀 수 없고, SQL Editor(postgres) 또는 운영자 계정만 변경할 수 있다.

## 3. 이메일 확인 설정

기본값에서는 Supabase가 가입 시 확인 메일을 보낸다.
로컬에서 테스트할 때 메일 확인 단계를 건너뛰려면
**Authentication → Sign In / Providers → Email → Confirm email** 을 끈다.

## 4. 환경변수

`.env.example` 을 복사해 `.env.local` 을 만들고 다음을 채운다.

| 변수 | 위치 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API Keys → `anon` / `publishable` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API Keys → `service_role` / `secret` |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |

`service_role` 키는 RLS를 우회한다. 서버 코드에서만 쓰이며
(`src/lib/supabase/admin.ts`), 브라우저로 절대 노출되면 안 된다.
