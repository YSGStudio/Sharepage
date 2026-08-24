# 서울언남초등학교 연구학교 성과공유 웹사이트

AI·디지털 기반 교수·학습 혁신(BRIDGE 모델) 연구학교의 운영 성과를 공개하고,
교사가 수업자료·지도안·사진을 계속 채워 나가는 사이트입니다.

- 스택: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
- 데이터: Supabase (Postgres + Storage + Auth)
- 지도안 생성: OpenAI

## 처음 실행하기

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

### 1. 환경변수

`.env.local` 에 다음 5개를 채웁니다. 자세한 위치는 `supabase/README.md` 참고.

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon(공개) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 — **서버 전용, 절대 공유 금지** |
| `OPENAI_API_KEY` | 지도안 생성용 |
| `OPENAI_MODEL` | 선택. 비우면 `gpt-4o` |

### 2. 데이터베이스

Supabase 대시보드 → SQL Editor 에서 `supabase/migrations/0001_init.sql` 실행.
되돌리려면 `supabase/migrations/0001_init_rollback.sql`.

### 3. 운영자 계정

운영자는 사이트 UI로 만들지 않습니다. `/signup` 으로 가입한 뒤 SQL Editor 에서
승격합니다 — 자세한 절차는 `supabase/README.md`.

## 구조

```
src/
  app/
    (auth)/          로그인·가입
    about|model|roles|timeline|results/   연구 소개 (DB 없는 정적 콘텐츠)
    materials/       수업자료 목록·업로드
    gallery/         운영 사진
    testimonials/    소감 제출·열람
    lesson-plan/     BRIDGE 지도안 생성기
    teacher/         교사 개인 화면
    admin/           운영자 화면 (가입·소감 승인)
    api/             쓰기 작업 엔드포인트
  content/           정적 콘텐츠 데이터 (연구·BRIDGE·조직도·타임라인·결과)
  lib/
    lesson-plan/     입력 검증 · 프롬프트 · 생성 · rate limit
    supabase/        서버·브라우저·service role 클라이언트
    auth.ts guards.ts  권한 판정
  proxy.ts           Supabase 세션 쿠키 갱신
                     (Next.js 16 에서 middleware → proxy 로 규약이 바뀜)
supabase/migrations/ SQL 마이그레이션
tests/               vitest 단위·통합 테스트
scripts/verify-db.mjs  DB 연동 수용 기준 검증
```

### 권한 모델

| 주체 | 열람 | 지도안 생성·다운로드 | 업로드·지도안 저장 | 삭제·승인 |
| --- | --- | --- | --- | --- |
| 비로그인 방문자 | O | O | X | X |
| 승인 대기 교사 | O | O | X | X |
| 일반 교사 (approved) | O | O | O | X |
| 운영자 (admin) | O | O | O | O |

권한은 두 겹으로 막습니다.

1. **API 층** — `src/lib/guards.ts` 가 401/403 과 사람이 읽을 메시지를 돌려줍니다.
2. **DB 층 (RLS)** — 마지막 방어선. API를 우회해도 Postgres가 막습니다.

`teachers.role` / `status` 는 트리거로 보호되어, 로그인 사용자의 요청으로는
스스로를 운영자나 승인 상태로 바꿀 수 없습니다.

## 검증

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest — 입력 검증, 프롬프트, rate limit, 권한 경계
npm run build       # 프로덕션 빌드
npm run verify:db   # DB 연동 수용 기준 (마이그레이션 적용 후)
```

`npm run verify:db` 는 검증용 계정 3개(운영자·일반 교사·승인대기)를 만들어
업로드·삭제·승인 흐름과 rate limit 을 실제로 돌려 보고, 끝나면 스스로 지웁니다.
실행하려면 앱이 떠 있어야 하고(`npx next start -p 3100`),
Supabase의 **Authentication → Email → Confirm email** 이 꺼져 있어야 합니다.

## 이미지 최적화

갤러리 사진은 Next.js 이미지 최적화(`next/image`)를 거칩니다.
허용 호스트는 `next.config.ts` 에서 `NEXT_PUBLIC_SUPABASE_URL` 을 파싱해 자동으로
잡으므로, 개발/운영 Supabase 프로젝트가 달라도 별도 설정이 필요 없습니다.

```ts
// next.config.ts — 프로젝트 ref 를 하드코딩하지 않는다
images: {
  remotePatterns: [{
    protocol: "https",
    hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
    pathname: "/storage/v1/object/public/**",
  }],
}
```

`pathname` 을 공개 버킷 경로로 좁혔기 때문에 다른 경로나 외부 호스트의 이미지는
최적화 프록시로 통과하지 않습니다(400).

> 배포 시 주의: `NEXT_PUBLIC_SUPABASE_URL` 은 **빌드 시점에** 읽힙니다.
> Vercel 등에서 이 값을 바꿨다면 재배포해야 반영됩니다.

## 콘텐츠 수정

연구 소개·BRIDGE·조직도·타임라인·결과는 DB가 아니라 `src/content/*.ts` 에 있습니다.
빌드 시점에 코드로 들어가므로 조회 API나 DB 쿼리를 거치지 않습니다.

조직도 담당자명은 공개 사이트임을 고려해 **이니셜**로 표기합니다
(`src/content/organization.ts`). 학교에서 실명 공개를 확정하면 그 파일의
`members` 값만 바꾸면 됩니다.
