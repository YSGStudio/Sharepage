/**
 * DB 연동 수용 기준 검증 스크립트 (AC2, AC4~AC8, AC11~AC13).
 *
 * 사전 조건
 *   1. supabase/migrations/0001_init.sql 을 SQL Editor 에서 실행했을 것
 *   2. .env.local 에 URL / anon / service_role 키가 채워져 있을 것
 *   3. Supabase Authentication > Email > "Confirm email" 을 꺼 둘 것
 *      (켜져 있으면 테스트 계정이 로그인하지 못한다)
 *
 * 실행
 *   npm run build && npx next start -p 3100 &
 *   node scripts/verify-db.mjs
 *
 * 스크립트가 만든 테스트 계정·데이터는 마지막에 스스로 지운다.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------- 설정
const BASE = process.env.BASE ?? "http://localhost:3100";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !ANON || !SERVICE) {
  console.error("✗ .env.local 에 URL / anon / service_role 키가 모두 있어야 합니다.");
  process.exit(1);
}

const admin = createClient(URL_, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------- 유틸
const results = [];
let currentAc = "-";

function check(name, passed, detail = "") {
  results.push({ ac: currentAc, name, passed, detail });
  const mark = passed ? "\x1b[32m PASS \x1b[0m" : "\x1b[31m FAIL \x1b[0m";
  console.log(`${mark} [${currentAc}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function section(ac, title) {
  currentAc = ac;
  console.log(`\n\x1b[1m── ${ac}: ${title}\x1b[0m`);
}

const stamp = Date.now();
const accounts = {
  admin: { email: `verify-admin-${stamp}@example.com`, password: "Test-1234!" },
  teacher: { email: `verify-teacher-${stamp}@example.com`, password: "Test-1234!" },
  pending: { email: `verify-pending-${stamp}@example.com`, password: "Test-1234!" },
};
const createdUserIds = [];
const createdMaterialIds = [];
const createdTestimonialIds = [];

/** 해당 사용자의 access token 을 가진 supabase 클라이언트를 만든다 (RLS 적용). */
async function clientFor(account) {
  const c = createClient(URL_, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await c.auth.signInWithPassword(account);
  if (error) throw new Error(`${account.email} 로그인 실패: ${error.message}`);
  return { client: c, userId: data.user.id, token: data.session.access_token };
}

// ---------------------------------------------------------------- 0. 사전 점검
console.log(`대상: ${URL_}`);
console.log(`앱  : ${BASE}\n`);

section("사전", "스키마 적용 확인");

for (const table of [
  "teachers",
  "teaching_materials",
  "photos",
  "testimonials",
  "lesson_plans",
  "api_rate_limits",
]) {
  const { error } = await admin.from(table).select("*").limit(1);
  check(`테이블 ${table} 존재`, !error, error?.message ?? "");
}

if (results.some((r) => !r.passed)) {
  console.error(
    "\n✗ 스키마가 적용되지 않았습니다. Supabase SQL Editor 에서 supabase/migrations/0001_init.sql 을 먼저 실행하세요.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------- 1. 계정 준비
section("AC12", "가입 직후 상태는 pending (R21, R22)");

for (const [role, account] of Object.entries(accounts)) {
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { name: `검증-${role}`, division: "연구·기획 분과" },
  });
  if (error) {
    check(`${role} 계정 생성`, false, error.message);
    process.exit(1);
  }
  account.id = data.user.id;
  createdUserIds.push(data.user.id);
}

// 트리거가 teachers 행을 만들었는지
const { data: profiles } = await admin
  .from("teachers")
  .select("*")
  .in("id", createdUserIds);

check(
  "가입 시 teachers 행이 자동 생성됨",
  profiles?.length === 3,
  `${profiles?.length ?? 0}/3`,
);
check(
  "모든 신규 계정이 role='teacher', status='pending'",
  profiles?.every((p) => p.role === "teacher" && p.status === "pending"),
  profiles?.map((p) => `${p.role}/${p.status}`).join(", "),
);

// admin, teacher 승격
await admin
  .from("teachers")
  .update({ role: "admin", status: "approved" })
  .eq("id", accounts.admin.id);
await admin
  .from("teachers")
  .update({ status: "approved" })
  .eq("id", accounts.teacher.id);
// pending 계정은 그대로 둔다

const adminSession = await clientFor(accounts.admin);
const teacherSession = await clientFor(accounts.teacher);
const pendingSession = await clientFor(accounts.pending);
const anonClient = createClient(URL_, ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 승인 대기 계정이 업로드를 시도하면 막혀야 한다
{
  const { error } = await pendingSession.client
    .from("teaching_materials")
    .insert({
      title: "승인대기 업로드 시도",
      subject: "과학",
      grade: "4학년",
      file_path: "x/y.pdf",
      file_name: "y.pdf",
      uploader_id: pendingSession.userId,
    });
  check("승인 대기 계정의 수업자료 등록이 RLS로 거부됨", Boolean(error), error?.code ?? "거부되지 않음");
}
{
  const { error } = await pendingSession.client.from("lesson_plans").insert({
    teacher_id: pendingSession.userId,
    grade: "4학년",
    subject: "과학",
    achievement_standard: "x",
    goal: "x",
    task: "x",
    eval_criteria_top: "x",
    generated_content: "x",
  });
  check("승인 대기 계정의 지도안 저장이 RLS로 거부됨", Boolean(error), error?.code ?? "거부되지 않음");
}

// ---------------------------------------------------------------- AC13
section("AC13", "운영자 승인 후 교사 전용 기능 동작 (R23)");

await admin
  .from("teachers")
  .update({ status: "approved" })
  .eq("id", accounts.pending.id);

const approvedNow = await clientFor(accounts.pending);
{
  const { data, error } = await approvedNow.client
    .from("teaching_materials")
    .insert({
      title: "승인 후 업로드",
      subject: "과학",
      grade: "4학년",
      file_path: `materials/verify/${stamp}-approved.txt`,
      file_name: "approved.txt",
      uploader_id: approvedNow.userId,
    })
    .select("id")
    .single();
  check("승인 직후 같은 계정으로 수업자료 등록 성공", !error, error?.message ?? "");
  if (data) createdMaterialIds.push(data.id);
}

// 원상복구
await admin
  .from("teachers")
  .update({ status: "pending" })
  .eq("id", accounts.pending.id);

// ---------------------------------------------------------------- AC2
section("AC2", "수업자료 업로드 → Storage 저장 → 다운로드 (R6, R7)");

for (const [label, slug, session] of [
  ["운영자", "admin", adminSession],
  ["일반 교사", "teacher", teacherSession],
]) {
  // Storage 키는 ASCII 만 허용된다. 앱도 buildStoragePath() 로 UUID 경로를 쓰고
  // 한글 원본 파일명은 DB 의 file_name 에만 보관한다.
  const path = `materials/verify/${stamp}-${slug}.txt`;
  const body = `검증용 파일 (${label})`;

  const { error: upErr } = await session.client.storage
    .from("materials")
    .upload(path, new Blob([body], { type: "text/plain" }), { upsert: true });
  check(`${label} 계정 Storage 업로드`, !upErr, upErr?.message ?? "");

  const { data, error } = await session.client
    .from("teaching_materials")
    .insert({
      title: `${label} 업로드 자료`,
      subject: "과학",
      grade: "4학년",
      file_path: path,
      file_name: `${label} 자료.txt`, // 원본 이름에는 한글이 들어가도 된다
      uploader_id: session.userId,
    })
    .select("id")
    .single();
  check(`${label} 계정 teaching_materials 레코드 생성`, !error, error?.message ?? "");
  if (data) createdMaterialIds.push(data.id);

  const { data: pub } = anonClient.storage.from("materials").getPublicUrl(path);
  const res = await fetch(pub.publicUrl);
  const text = await res.text();
  check(
    `${label} 업로드 파일을 비로그인 상태로 다운로드`,
    res.ok && text === body,
    `HTTP ${res.status}`,
  );
}

{
  const { data } = await anonClient.from("teaching_materials").select("id");
  check("비로그인 방문자가 수업자료 목록 조회 가능", (data?.length ?? 0) > 0, `${data?.length ?? 0}건`);
}

// ---------------------------------------------------------------- AC7
section("AC7", "삭제는 운영자만 (R16)");

const targetMaterial = createdMaterialIds[0];
{
  const { error, count } = await teacherSession.client
    .from("teaching_materials")
    .delete({ count: "exact" })
    .eq("id", targetMaterial);
  // RLS 는 조건에 맞지 않는 행을 "안 보이게" 하므로 0건 삭제로 나타난다
  check(
    "일반 교사의 수업자료 삭제가 거부됨(0건 삭제)",
    count === 0 || Boolean(error),
    `count=${count}, error=${error?.message ?? "none"}`,
  );
}
{
  const { data } = await admin
    .from("teaching_materials")
    .select("id")
    .eq("id", targetMaterial);
  check("일반 교사 삭제 시도 후에도 자료가 남아 있음", (data?.length ?? 0) === 1);
}
{
  const { count } = await adminSession.client
    .from("teaching_materials")
    .delete({ count: "exact" })
    .eq("id", targetMaterial);
  check("운영자는 정상 삭제", count === 1, `count=${count}`);
}

// ---------------------------------------------------------------- AC5 / AC8
section("AC5", "소감 제출은 즉시 비공개, 운영자 승인 후 공개 (R12, R13)");

{
  // .select() 를 붙이면 안 된다. 방금 넣은 pending 행은 anon 의 SELECT 정책
  // (status='approved' 만 공개)에 걸려 되돌려받을 수 없고, PostgREST 는 이를
  // RLS 위반으로 보고한다. 앱의 /api/testimonials 도 select 없이 insert 만 한다.
  const { error } = await anonClient.from("testimonials").insert({
    author_type: "parent",
    author_name: "검증용 학부모",
    content: `검증용 소감 ${stamp}`,
    status: "pending",
  });
  check("비로그인 방문자가 소감 제출 가능", !error, error?.message ?? "");
}

// id 는 service role 로 되찾는다 (anon 은 pending 행을 볼 수 없는 게 정상이다)
{
  const { data } = await admin
    .from("testimonials")
    .select("id")
    .eq("content", `검증용 소감 ${stamp}`)
    .maybeSingle();
  if (data) createdTestimonialIds.push(data.id);
  check("제출된 소감이 DB에 pending 으로 저장됨", Boolean(data));
}

const testimonialId = createdTestimonialIds[0];
{
  const { data } = await anonClient
    .from("testimonials")
    .select("id")
    .eq("id", testimonialId);
  check("제출 직후 공개 목록에 노출되지 않음", (data?.length ?? 0) === 0);
}
{
  const { data } = await adminSession.client
    .from("testimonials")
    .select("id")
    .eq("id", testimonialId);
  check("운영자는 대기 중인 소감을 조회 가능", (data?.length ?? 0) === 1);
}
{
  const { data } = await teacherSession.client
    .from("testimonials")
    .select("id")
    .eq("id", testimonialId);
  check("일반 교사는 대기 중인 소감을 볼 수 없음", (data?.length ?? 0) === 0);
}

section("AC8", "소감 승인·거부는 운영자만 (R17)");

{
  const { count } = await teacherSession.client
    .from("testimonials")
    .update({ status: "approved" }, { count: "exact" })
    .eq("id", testimonialId);
  check("일반 교사의 소감 승인이 거부됨(0건 변경)", count === 0, `count=${count}`);
}
{
  const { data } = await admin
    .from("testimonials")
    .select("status")
    .eq("id", testimonialId)
    .single();
  check("일반 교사 시도 후에도 상태가 pending", data?.status === "pending", data?.status);
}
{
  const { count, error } = await adminSession.client
    .from("testimonials")
    .update({ status: "approved", reviewed_by: adminSession.userId }, { count: "exact" })
    .eq("id", testimonialId);
  check("운영자의 소감 승인 성공", count === 1 && !error, error?.message ?? `count=${count}`);
}
{
  const { data } = await anonClient
    .from("testimonials")
    .select("id")
    .eq("id", testimonialId);
  check("승인 후 공개 목록에 노출됨", (data?.length ?? 0) === 1);
}

// ---------------------------------------------------------------- AC6
section("AC6", "사진 업로드 → 갤러리 최신순 노출 (R14, R15)");

const photoIds = [];
for (const [label, session] of [
  ["운영자", adminSession],
  ["일반 교사", teacherSession],
]) {
  const { data, error } = await session.client
    .from("photos")
    .insert({
      storage_path: `photos/verify/${stamp}-${label}.png`,
      caption: `${label} 업로드 사진`,
      category: "수업 나눔",
      uploader_id: session.userId,
    })
    .select("id, created_at")
    .single();
  check(`${label} 계정 사진 등록`, !error, error?.message ?? "");
  if (data) photoIds.push(data.id);
  await new Promise((r) => setTimeout(r, 1100)); // created_at 순서를 벌린다
}

{
  const { data } = await anonClient
    .from("photos")
    .select("id, created_at")
    .order("created_at", { ascending: false });
  const ours = data?.filter((p) => photoIds.includes(p.id)) ?? [];
  check("비로그인 방문자가 갤러리 조회 가능", ours.length === 2, `${ours.length}/2`);
  check(
    "최신순으로 정렬됨",
    ours.length === 2 && ours[0].id === photoIds[1],
    "가장 최근 업로드가 맨 앞",
  );
}

{
  const { count } = await teacherSession.client
    .from("photos")
    .delete({ count: "exact" })
    .eq("id", photoIds[0]);
  check("일반 교사의 사진 삭제가 거부됨(AC7)", count === 0, `count=${count}`);
}

// ---------------------------------------------------------------- AC4
section("AC4", "지도안 저장 후 재열람 (R11)");

let planId = null;
{
  const { data, error } = await teacherSession.client
    .from("lesson_plans")
    .insert({
      teacher_id: teacherSession.userId,
      grade: "4학년",
      subject: "과학",
      achievement_standard: "[4과05-01] 물질의 성질을 설명할 수 있다.",
      goal: "물질의 성질에 따라 물체를 분류할 수 있다.",
      task: "교실 물체 분류하기",
      eval_criteria_top: "두 가지 이상 근거로 정확히 분류한다.",
      generated_content: `검증용 지도안 ${stamp}\nBuzz / Related / Investigate Together`,
    })
    .select("id")
    .single();
  check("승인된 교사의 지도안 저장", !error, error?.message ?? "");
  planId = data?.id ?? null;
}

if (planId) {
  // 새 세션 = 새로고침에 해당
  const fresh = await clientFor(accounts.teacher);
  const { data } = await fresh.client
    .from("lesson_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();
  check("새 세션에서도 목록에 남아 있음", Boolean(data));
  check(
    "저장된 내용이 동일하게 재열람됨",
    data?.generated_content?.includes(`검증용 지도안 ${stamp}`),
  );

  const { data: otherView } = await adminSession.client
    .from("lesson_plans")
    .select("id")
    .eq("id", planId);
  check(
    "지도안은 본인만 볼 수 있음 (운영자도 조회 불가)",
    (otherView?.length ?? 0) === 0,
    "개인 작업물",
  );
}

// ---------------------------------------------------------------- AC11
section("AC11", "지도안 생성 IP당 하루 10회 제한 (R20)");

const testIp = `203.0.113.${(stamp % 200) + 10}`;
const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

{
  // 별도 IP 를 쓴다. 이 호출이 성공해 버리면(=결함) 아래 10회 카운트가 밀린다.
  const probeIp = `${testIp}-anon-probe`;
  const { data, error } = await anonClient.rpc("increment_rate_limit", {
    p_ip_address: probeIp,
    p_request_date: today,
    p_limit: 10,
  });
  check(
    "익명 사용자는 rate limit 함수를 직접 호출할 수 없음",
    Boolean(error),
    error?.message ??
      `호출됨(결과 ${JSON.stringify(data)}) — 임의 IP 의 카운터를 올려 정상 사용자를 차단시킬 수 있다`,
  );
  await admin.from("api_rate_limits").delete().eq("ip_address", probeIp);
}

let lastAllowed = null;
for (let i = 1; i <= 11; i++) {
  const { data, error } = await admin.rpc("increment_rate_limit", {
    p_ip_address: testIp,
    p_request_date: today,
    p_limit: 10,
  });
  if (error) {
    check(`${i}회차 호출`, false, error.message);
    break;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (i <= 10) {
    if (i === 10) check("10회차까지 허용됨", row.allowed === true, `count=${row.current_count}`);
  } else {
    lastAllowed = row;
  }
}
check(
  "11회차부터 거부됨",
  lastAllowed?.allowed === false,
  `count=${lastAllowed?.current_count}`,
);

{
  const tomorrow = new Date(Date.now() + 9 * 3600 * 1000 + 86400000)
    .toISOString()
    .slice(0, 10);
  const { data } = await admin.rpc("increment_rate_limit", {
    p_ip_address: testIp,
    p_request_date: tomorrow,
    p_limit: 10,
  });
  const row = Array.isArray(data) ? data[0] : data;
  check(
    "날짜가 바뀌면 카운터가 초기화됨 (KST 자정 기준)",
    row?.allowed === true && Number(row?.current_count) === 1,
    `count=${row?.current_count}`,
  );
  await admin
    .from("api_rate_limits")
    .delete()
    .eq("ip_address", testIp);
}

// 앱의 실제 엔드포인트도 429를 내는지 (OpenAI 호출 없이 초과 상태를 먼저 만든다)
{
  const probeIp = `203.0.113.${(stamp % 200) + 211}`;
  for (let i = 0; i < 10; i++) {
    await admin.rpc("increment_rate_limit", {
      p_ip_address: probeIp,
      p_request_date: today,
      p_limit: 10,
    });
  }
  const res = await fetch(`${BASE}/api/lesson-plan/generate`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": probeIp },
    body: JSON.stringify({
      grade: "4학년",
      subject: "과학",
      achievementStandard: "[4과05-01] 물질의 성질을 설명할 수 있다.",
      goal: "분류할 수 있다.",
      task: "분류하기",
      evalCriteriaTop: "정확히 분류한다.",
    }),
  });
  const json = await res.json().catch(() => ({}));
  check(
    "앱 엔드포인트가 한도 초과 시 429 반환",
    res.status === 429,
    `HTTP ${res.status} — ${json.error ?? ""}`,
  );
  await admin.from("api_rate_limits").delete().eq("ip_address", probeIp);
}

// ---------------------------------------------------------------- 정리
section("정리", "테스트 데이터 삭제");

await admin.from("lesson_plans").delete().in("teacher_id", createdUserIds);
await admin.from("photos").delete().in("id", photoIds);
await admin.from("testimonials").delete().in("id", createdTestimonialIds);
await admin.from("teaching_materials").delete().in("id", createdMaterialIds);
{
  const { data: files } = await admin.storage
    .from("materials")
    .list("materials/verify");
  const ours = (files ?? []).filter((f) => f.name.startsWith(String(stamp)));
  if (ours.length) {
    await admin.storage
      .from("materials")
      .remove(ours.map((f) => `materials/verify/${f.name}`));
  }
}
for (const id of createdUserIds) {
  await admin.auth.admin.deleteUser(id);
}
check("테스트 계정·데이터 정리 완료", true);

// ---------------------------------------------------------------- 결과
const failed = results.filter((r) => !r.passed);
console.log(`\n${"─".repeat(60)}`);
console.log(`총 ${results.length}개 확인, 실패 ${failed.length}개`);
if (failed.length) {
  console.log("\n실패 항목:");
  for (const f of failed) console.log(`  [${f.ac}] ${f.name} — ${f.detail}`);
}
console.log(failed.length === 0 ? "\n=== ALL PASS ===" : "\n=== FAILURES ===");
process.exit(failed.length === 0 ? 0 : 1);
