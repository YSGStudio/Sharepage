"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Select, TextArea, TextInput } from "@/components/form";
import {
  ActivityCard,
  BoardColumn,
  BoardScroller,
} from "@/components/timeline-board";
import type { ActivityStatus, TimelineActivity } from "@/lib/supabase/types";
import {
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABELS,
  MAX_TITLE_LENGTH,
} from "@/lib/timeline-activity";
import type { BoardColumnData } from "@/lib/timeline-columns";

interface FormValues {
  title: string;
  assignees: string;
  status: ActivityStatus;
  note: string;
}

const EMPTY_FORM: FormValues = {
  title: "",
  assignees: "",
  status: "not_started",
  note: "",
};

/**
 * 운영자용 월별 추진활동 보드 (R16 기준: 쓰기는 운영자만).
 * 달마다 카드를 추가하고, 카드별로 상태 변경·수정·삭제를 한다.
 */
export function ActivityBoardAdmin({ columns }: { columns: BoardColumnData[] }) {
  const router = useRouter();
  const [extraPeriods, setExtraPeriods] = useState<
    { year: number; month: number }[]
  >([]);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(
    url: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown,
  ): Promise<string | null> {
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        return json.error ?? "처리에 실패했습니다.";
      }
      router.refresh();
      return null;
    } catch {
      return "네트워크 오류입니다.";
    }
  }

  async function create(column: BoardColumnData, values: FormValues) {
    const message = await send("/api/timeline", "POST", {
      year: column.year,
      month: column.month,
      ...values,
    });
    if (message) return message;
    setAddingKey(null);
    return null;
  }

  async function update(activity: TimelineActivity, values: FormValues) {
    const message = await send(`/api/timeline/${activity.id}`, "PATCH", {
      year: activity.year,
      month: activity.month,
      ...values,
    });
    if (message) return message;
    setEditingId(null);
    return null;
  }

  async function changeStatus(activity: TimelineActivity, status: ActivityStatus) {
    setBusyId(activity.id);
    setError(null);
    const message = await send(`/api/timeline/${activity.id}`, "PATCH", { status });
    if (message) setError(message);
    setBusyId(null);
  }

  async function remove(activity: TimelineActivity) {
    setBusyId(activity.id);
    setError(null);
    const message = await send(`/api/timeline/${activity.id}`, "DELETE");
    if (message) setError(message);
    setBusyId(null);
  }

  // 연구 일정(2026.2~2027.1) 밖의 달도 운영자가 직접 열 수 있다.
  const allColumns = [...columns];
  for (const period of extraPeriods) {
    const key = `${period.year}-${period.month}`;
    if (allColumns.some((c) => c.key === key)) continue;
    allColumns.push({
      key,
      year: period.year,
      month: period.month,
      phase: null,
      headline: null,
      plannedActivities: [],
      activities: [],
    });
  }
  allColumns.sort((a, b) => a.year - b.year || a.month - b.month);

  return (
    <div>
      <AddPeriod
        onAdd={(year, month) => {
          setExtraPeriods((prev) => [...prev, { year, month }]);
          setAddingKey(`${year}-${month}`);
        }}
      />

      {error && (
        <p role="status" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <BoardScroller>
        {allColumns.map((column) => (
          <BoardColumn
            key={column.key}
            year={column.year}
            month={column.month}
            phase={column.phase}
            headline={column.headline}
            count={column.activities.length}
            action={
              <button
                type="button"
                onClick={() =>
                  setAddingKey(addingKey === column.key ? null : column.key)
                }
                aria-label={`${column.month}월 활동 추가`}
                aria-expanded={addingKey === column.key}
                className="shrink-0 rounded-lg border border-surface-variant bg-surface-container-lowest px-2 py-1 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
              >
                +
              </button>
            }
          >
            {addingKey === column.key && (
              <ActivityForm
                submitLabel="등록"
                onCancel={() => setAddingKey(null)}
                onSubmit={(values) => create(column, values)}
              />
            )}

            {column.activities.length === 0 && addingKey !== column.key && (
              <p className="rounded-xl border border-dashed border-surface-variant px-3.5 py-4 text-xs text-on-surface-variant">
                등록된 활동이 없습니다. + 를 눌러 추가하세요.
              </p>
            )}

            {column.activities.map((activity) =>
              editingId === activity.id ? (
                <ActivityForm
                  key={activity.id}
                  submitLabel="저장"
                  initial={{
                    title: activity.title,
                    assignees: activity.assignees.join(", "),
                    status: activity.status,
                    note: activity.note ?? "",
                  }}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(values) => update(activity, values)}
                />
              ) : (
                <ActivityCard key={activity.id} activity={activity}>
                  <div className="mt-3 border-t border-surface-variant pt-2.5">
                    <div className="flex flex-wrap gap-1">
                      {ACTIVITY_STATUSES.filter((s) => s !== activity.status).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={busyId === activity.id}
                            onClick={() => changeStatus(activity, status)}
                            className="rounded-md border border-surface-variant px-2 py-1 text-[11px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary disabled:opacity-60"
                          >
                            → {ACTIVITY_STATUS_LABELS[status]}
                          </button>
                        ),
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingKey(null);
                          setEditingId(activity.id);
                        }}
                        className="rounded-md border border-brand-200 px-2 py-1 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        수정
                      </button>
                      <DeleteControl
                        busy={busyId === activity.id}
                        onDelete={() => remove(activity)}
                      />
                    </div>
                  </div>
                </ActivityCard>
              ),
            )}
          </BoardColumn>
        ))}
      </BoardScroller>
    </div>
  );
}

/** 등록·수정 공용 폼. 성공하면 null, 실패하면 오류 문구를 돌려주는 onSubmit 을 받는다. */
function ActivityForm({
  initial = EMPTY_FORM,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: FormValues;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `activity-form-${submitLabel}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const message = await onSubmit(values);
    if (message) setError(message);
    setBusy(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-brand-200 bg-surface-container-lowest p-3"
    >
      <Field label="활동 이름" htmlFor={`${id}-title`} required>
        <TextInput
          id={`${id}-title`}
          value={values.title}
          maxLength={MAX_TITLE_LENGTH}
          required
          placeholder="[지원팀] 드라이브 구축"
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
      </Field>

      <Field
        label="담당자"
        htmlFor={`${id}-assignees`}
        hint="쉼표로 구분해 여러 명을 적을 수 있습니다."
      >
        <TextInput
          id={`${id}-assignees`}
          value={values.assignees}
          placeholder="손미현, 양승근"
          onChange={(e) => setValues({ ...values, assignees: e.target.value })}
        />
      </Field>

      <Field label="상태" htmlFor={`${id}-status`}>
        <Select
          id={`${id}-status`}
          value={values.status}
          onChange={(e) =>
            setValues({ ...values, status: e.target.value as ActivityStatus })
          }
        >
          {ACTIVITY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ACTIVITY_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="설명" htmlFor={`${id}-note`} hint="선택 사항입니다.">
        <TextArea
          id={`${id}-note`}
          rows={2}
          value={values.note}
          onChange={(e) => setValues({ ...values, note: e.target.value })}
        />
      </Field>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "처리 중…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-surface-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          취소
        </button>
      </div>
    </form>
  );
}

/** 연구 일정 밖의 달을 보드에 여는 작은 폼 */
function AddPeriod({
  onAdd,
}: {
  onAdd: (year: number, month: number) => void;
}) {
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("1");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onAdd(Number(year), Number(month));
      }}
      className="mb-5 flex flex-wrap items-end gap-2 rounded-xl border border-surface-variant bg-surface-container-low p-3"
    >
      <div>
        <label htmlFor="add-period-year" className="block text-xs font-medium text-ink-700">
          연도
        </label>
        <TextInput
          id="add-period-year"
          type="number"
          min={2000}
          max={2100}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="mt-1 w-28"
        />
      </div>
      <div>
        <label htmlFor="add-period-month" className="block text-xs font-medium text-ink-700">
          월
        </label>
        <Select
          id="add-period-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-1 w-24"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </Select>
      </div>
      <button
        type="submit"
        className="rounded-lg border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        이 달 열기
      </button>
      <p className="text-xs text-on-surface-variant">
        연구 일정(2026년 2월~2027년 1월) 밖의 달에 활동을 등록할 때 씁니다.
      </p>
    </form>
  );
}

/** 카드 안에서 쓰는 2단계 삭제 버튼 */
function DeleteControl({
  busy,
  onDelete,
}: {
  busy: boolean;
  onDelete: () => void;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-50"
      >
        삭제
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-[11px] text-on-surface-variant">삭제할까요?</span>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {busy ? "삭제 중…" : "네"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={busy}
        className="rounded-md border border-surface-variant px-2 py-1 text-[11px] text-on-surface-variant hover:bg-surface-container-high"
      >
        아니요
      </button>
    </span>
  );
}
