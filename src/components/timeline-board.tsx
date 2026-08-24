import type { ReactNode } from "react";
import type { ActivityStatus, TimelineActivity } from "@/lib/supabase/types";
import { ACTIVITY_STATUS_LABELS } from "@/lib/timeline-activity";

/**
 * 월별 추진활동 보드의 표시용 조각들.
 * 공개 페이지(서버 컴포넌트)와 운영자 화면(클라이언트 컴포넌트)이 같은 모양을 쓰도록
 * 상태를 갖지 않는 순수 컴포넌트로만 둔다.
 */

const STATUS_STYLES: Record<ActivityStatus, { chip: string; dot: string }> = {
  not_started: { chip: "bg-surface-container text-ink-500", dot: "bg-outline" },
  in_progress: { chip: "bg-brand-100 text-brand-700", dot: "bg-brand-500" },
  done: { chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

/** 담당자 이름마다 같은 색이 나오도록 이름을 색표에 대응시킨다. */
const ASSIGNEE_TONES = [
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
  "bg-sky-50 text-sky-700",
  "bg-emerald-50 text-emerald-700",
  "bg-fuchsia-50 text-fuchsia-700",
] as const;

const MONTH_TONES = [
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
  "bg-sky-50 text-sky-700",
  "bg-emerald-50 text-emerald-700",
  "bg-fuchsia-50 text-fuchsia-700",
] as const;

function toneIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return hash % length;
}

export function StatusPill({ status }: { status: ActivityStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.chip}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {ACTIVITY_STATUS_LABELS[status]}
    </span>
  );
}

export function AssigneeChip({ name }: { name: string }) {
  const tone = ASSIGNEE_TONES[toneIndex(name, ASSIGNEE_TONES.length)];
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${tone}`}>
      {name}
    </span>
  );
}

/** 카드 한 장. children 은 운영자 화면에서 쓰는 버튼 줄. */
export function ActivityCard({
  activity,
  children,
}: {
  activity: TimelineActivity;
  children?: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-surface-variant bg-surface-container-lowest p-3.5 shadow-[0_1px_2px_rgba(25,28,29,0.04)]">
      <h4 className="text-sm font-semibold leading-snug text-on-surface">
        {activity.title}
      </h4>
      {activity.note && (
        <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
          {activity.note}
        </p>
      )}
      {activity.assignees.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {activity.assignees.map((name) => (
            <li key={name}>
              <AssigneeChip name={name} />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2.5">
        <StatusPill status={activity.status} />
      </div>
      {children}
    </article>
  );
}

/** 등록된 활동이 없는 달에 보여줄 기본 계획 카드 */
export function PlannedCard({ activities }: { activities: string[] }) {
  if (activities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-surface-variant px-3.5 py-4 text-xs text-on-surface-variant">
        등록된 활동이 없습니다.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-surface-variant bg-surface-container-low/60 p-3.5">
      <p className="text-xs font-semibold text-on-surface-variant">
        기본 계획
      </p>
      <ul className="mt-2 space-y-1.5">
        {activities.map((activity) => (
          <li
            key={activity}
            className="flex gap-1.5 text-xs leading-relaxed text-on-surface-variant"
          >
            <span aria-hidden className="text-outline">
              —
            </span>
            <span>{activity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 가로로 이어지는 월별 열. 가로 스크롤은 이 안에만 생긴다 (R18). */
export function BoardScroller({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
      <div className="flex snap-x snap-mandatory gap-4">{children}</div>
    </div>
  );
}

export function BoardColumn({
  year,
  month,
  phase,
  headline,
  count,
  action,
  children,
}: {
  year: number;
  month: number;
  phase?: string | null;
  headline?: string | null;
  count: number;
  action?: ReactNode;
  children: ReactNode;
}) {
  const tone = MONTH_TONES[(month - 1) % MONTH_TONES.length];

  return (
    <section
      aria-label={`${year}년 ${month}월 추진활동`}
      className="flex w-[17rem] shrink-0 snap-start flex-col rounded-2xl bg-surface-container-low p-3 sm:w-[19rem]"
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-sm font-semibold ${tone}`}>
              {month}월
            </span>
            <span className="text-sm font-semibold text-on-surface-variant">
              {count}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[11px] text-on-surface-variant">
            {year}년{phase ? ` · ${phase}` : ""}
          </p>
          {headline && (
            <p className="mt-0.5 text-xs font-medium text-on-surface">
              {headline}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}
