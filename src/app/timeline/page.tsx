import type { Metadata } from "next";
import Link from "next/link";
import { AssigneeChip, StatusPill } from "@/components/timeline-board";
import { Alert, Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { PHASE_DESCRIPTIONS, type PhaseName } from "@/content/timeline";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TimelineActivity } from "@/lib/supabase/types";
import { buildBoardColumns, type BoardColumnData } from "@/lib/timeline-columns";

export const metadata: Metadata = {
  title: "월별 추진현황",
  description:
    "2026년 2월부터 2027년 1월까지 계획·실행·결과분석·일반화 4단계의 월별 추진 활동을 정리했습니다.",
};

export const dynamic = "force-dynamic";

const PHASE_STYLES: Record<PhaseName, string> = {
  계획: "bg-brand-100 text-brand-700 border-brand-200",
  실행: "bg-accent-100 text-accent-700 border-accent-300",
  결과분석: "bg-slate-100 text-ink-700 border-slate-200",
  일반화: "bg-brand-600 text-white border-brand-600",
};

const PHASE_LAYOUT: Record<
  PhaseName,
  { accent: string; line: string; panel: string; number: string }
> = {
  계획: {
    accent: "bg-blue-600 text-white",
    line: "bg-blue-300",
    panel: "border-blue-200 bg-blue-50/50",
    number: "text-blue-700",
  },
  실행: {
    accent: "bg-emerald-600 text-white",
    line: "bg-emerald-300",
    panel: "border-emerald-200 bg-emerald-50/50",
    number: "text-emerald-700",
  },
  결과분석: {
    accent: "bg-violet-600 text-white",
    line: "bg-violet-300",
    panel: "border-violet-200 bg-violet-50/50",
    number: "text-violet-700",
  },
  일반화: {
    accent: "bg-amber-500 text-white",
    line: "bg-amber-300",
    panel: "border-amber-200 bg-amber-50/60",
    number: "text-amber-800",
  },
};

const PHASE_ORDER: PhaseName[] = ["계획", "실행", "결과분석", "일반화"];

function MonthRow({ column, isLast = false }: { column: BoardColumnData; isLast?: boolean }) {
  const phase = (column.phase ?? "계획") as PhaseName;
  const theme = PHASE_LAYOUT[phase] ?? PHASE_LAYOUT.계획;

  return (
    <article className="relative grid gap-4 pb-7 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6">
      <div className="relative flex items-center gap-3 sm:block sm:text-right">
        {!isLast && (
          <span
            aria-hidden
            className={`absolute left-6 top-12 h-[calc(100%+1.75rem)] w-px sm:left-auto sm:right-[-13px] ${theme.line}`}
          />
        )}
        <span className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-sm sm:ml-auto ${theme.accent}`}>
          {column.month}월
        </span>
        <div className="sm:mt-2">
          <p className="text-xs font-bold text-on-surface-variant">{column.year}년</p>
          <p className={`mt-0.5 text-xs font-bold ${theme.number}`}>{column.phase ?? "추가 일정"}</p>
        </div>
      </div>

      <div className={`min-w-0 rounded-2xl border p-5 shadow-sm sm:p-6 ${theme.panel}`}>
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-black/10 pb-4">
          <div>
            <h4 className="text-lg font-bold text-on-surface">{column.headline ?? "추진 활동"}</h4>
            <p className="mt-1 text-xs text-on-surface-variant">
              {column.activities.length > 0
                ? `등록된 활동 ${column.activities.length}건`
                : `기본 운영 계획 ${column.plannedActivities.length}건`}
            </p>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${PHASE_STYLES[phase]}`}>
            {column.phase ?? "추가"}
          </span>
        </div>

        {column.activities.length > 0 ? (
          <ul className="divide-y divide-black/10">
            {column.activities.map((activity) => (
              <li key={activity.id} className="py-4 first:pt-4 last:pb-0">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold leading-relaxed text-on-surface">{activity.title}</p>
                    {activity.note && (
                      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{activity.note}</p>
                    )}
                    {activity.assignees.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {activity.assignees.map((name) => (
                          <li key={name}><AssigneeChip name={name} /></li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="shrink-0"><StatusPill status={activity.status} /></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-black/10">
            {column.plannedActivities.map((activity) => (
              <li key={activity} className="flex gap-3 py-3.5 text-sm leading-relaxed text-ink-700 last:pb-0">
                <span aria-hidden className={`mt-2 h-2 w-2 shrink-0 rounded-full ${theme.accent.split(" ")[0]}`} />
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default async function TimelinePage() {
  const user = await getCurrentUser().catch(() => null);
  const admin = isAdmin(user);

  let activities: TimelineActivity[] = [];
  let loadError: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("timeline_activities")
      .select("*")
      .order("year", { ascending: true })
      .order("month", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) loadError = error.message;
    activities = (data as TimelineActivity[] | null) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  const columns = buildBoardColumns(activities);
  const registered = activities.length;
  const done = activities.filter((activity) => activity.status === "done").length;
  const inProgress = activities.filter(
    (activity) => activity.status === "in_progress",
  ).length;
  const plannedMonths = columns.filter((column) => column.activities.length === 0).length;
  const extraColumns = columns.filter((column) => !column.phase);

  return (
    <>
      <PageHeader
        eyebrow="연구 소개"
        title="월별 추진현황"
        description="연구 준비를 시작한 2026년 2월부터 마무리하는 2027년 1월까지, 매달 무엇을 했는지 단계별로 정리했습니다."
      />

      <Container>
        <Section title="4단계 개요">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PHASE_DESCRIPTIONS) as PhaseName[]).map((phase) => (
              <Card key={phase}>
                <span
                  className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${PHASE_STYLES[phase]}`}
                >
                  {phase}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">
                  {PHASE_DESCRIPTIONS[phase]}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="월별 추진 활동"
          description="전체 일정을 단계별로 한눈에 살펴보고, 자세히 볼 달을 선택해 담당자와 진행 상태를 확인할 수 있습니다."
        >
          {/* 불러오기 실패는 운영자에게만 알린다. 방문자에게는 기본 계획을 그대로 보여준다. */}
          {loadError && admin && (
            <div className="mb-6">
              <Alert tone="warning" title="추진활동을 불러오지 못했습니다">
                {loadError} · 아래는 기본 운영 계획입니다.
              </Alert>
            </div>
          )}

          {admin && (
            <div className="mb-6">
              <Link
                href="/admin/timeline"
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                추진활동 등록·수정
              </Link>
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
              <p className="text-xs font-semibold text-brand-700">전체 일정</p>
              <p className="mt-1 text-2xl font-black text-brand-900">{columns.length}<span className="ml-1 text-sm font-semibold">개월</span></p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-700">완료 활동</p>
              <p className="mt-1 text-2xl font-black text-emerald-900">{done}<span className="ml-1 text-sm font-semibold">건</span></p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-800">진행 중</p>
              <p className="mt-1 text-2xl font-black text-amber-900">{inProgress}<span className="ml-1 text-sm font-semibold">건</span></p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600">계획 표시 월</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{plannedMonths}<span className="ml-1 text-sm font-semibold">개월</span></p>
            </div>
          </div>

          <div className="space-y-10">
            {PHASE_ORDER.map((phase, phaseIndex) => {
              const phaseColumns = columns.filter((column) => column.phase === phase);
              if (phaseColumns.length === 0) return null;
              const theme = PHASE_LAYOUT[phase];

              return (
                <section key={phase} aria-labelledby={`timeline-phase-${phaseIndex}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${theme.accent}`}>
                      {phaseIndex + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 id={`timeline-phase-${phaseIndex}`} className="text-lg font-bold text-on-surface">{phase}</h3>
                      <p className="text-xs leading-relaxed text-on-surface-variant">{PHASE_DESCRIPTIONS[phase]}</p>
                    </div>
                    <div aria-hidden className={`hidden h-px flex-1 sm:block ${theme.line}`} />
                    <span className={`hidden rounded-full px-2.5 py-1 text-xs font-bold sm:inline ${theme.panel} ${theme.number}`}>
                      {phaseColumns.length}개월
                    </span>
                  </div>

                  <div>
                    {phaseColumns.map((column, columnIndex) => (
                      <MonthRow
                        key={column.key}
                        column={column}
                        isLast={columnIndex === phaseColumns.length - 1}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {extraColumns.length > 0 && (
              <section aria-labelledby="timeline-extra-periods">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-black text-white">+</span>
                  <div className="min-w-0">
                    <h3 id="timeline-extra-periods" className="text-lg font-bold text-on-surface">추가 일정</h3>
                    <p className="text-xs leading-relaxed text-on-surface-variant">기본 연구 기간 밖에 추가로 등록된 추진 활동입니다.</p>
                  </div>
                  <div aria-hidden className="hidden h-px flex-1 bg-slate-300 sm:block" />
                </div>
                <div>
                  {extraColumns.map((column, columnIndex) => (
                    <MonthRow
                      key={column.key}
                      column={column}
                      isLast={columnIndex === extraColumns.length - 1}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </Section>

        <div className="flex flex-wrap gap-2">
          <Badge>전체 {columns.length}개월</Badge>
          <Badge tone="muted">등록된 활동 {registered}건</Badge>
        </div>
      </Container>
    </>
  );
}
