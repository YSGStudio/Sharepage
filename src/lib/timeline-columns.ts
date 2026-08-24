import { TIMELINE } from "@/content/timeline";
import type { TimelineActivity } from "@/lib/supabase/types";

/**
 * 정적 연구 일정과 DB 에 등록된 활동을 하나의 월별 보드로 합친다.
 * 화면(서버 컴포넌트)에서만 쓰므로 정적 일정 데이터를 함께 들고 있어도 괜찮다.
 */

export interface BoardColumnData {
  key: string;
  year: number;
  month: number;
  /** 정적 계획(content/timeline.ts)에서 가져온 단계·요약. 없으면 null. */
  phase: string | null;
  headline: string | null;
  /** 운영자가 등록하지 않은 달에 보여줄 기본 계획 문구. */
  plannedActivities: string[];
  activities: TimelineActivity[];
}

/**
 * 정적 연구 일정(2026.2 ~ 2027.1)을 기본 뼈대로 두고,
 * 그 밖의 달에 등록된 활동이 있으면 연·월 순서에 맞춰 열을 덧붙인다.
 */
export function buildBoardColumns(
  activities: TimelineActivity[],
): BoardColumnData[] {
  const byKey = new Map<string, TimelineActivity[]>();
  for (const activity of activities) {
    const key = periodKey(activity.year, activity.month);
    const bucket = byKey.get(key);
    if (bucket) bucket.push(activity);
    else byKey.set(key, [activity]);
  }

  const columns = new Map<string, BoardColumnData>();

  for (const item of TIMELINE) {
    const year = Number(item.yearLabel);
    const month = Number(item.month.replace("월", ""));
    const key = periodKey(year, month);
    columns.set(key, {
      key,
      year,
      month,
      phase: item.phase,
      headline: item.headline,
      plannedActivities: item.activities,
      activities: byKey.get(key) ?? [],
    });
  }

  for (const [key, bucket] of byKey) {
    if (columns.has(key)) continue;
    const [year, month] = key.split("-").map(Number);
    columns.set(key, {
      key,
      year,
      month,
      phase: null,
      headline: null,
      plannedActivities: [],
      activities: bucket,
    });
  }

  return [...columns.values()].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  );
}

function periodKey(year: number, month: number): string {
  return `${year}-${month}`;
}
