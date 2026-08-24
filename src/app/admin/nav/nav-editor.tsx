"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Select, TextInput } from "@/components/form";
import { Alert, Card } from "@/components/ui";
import {
  groupNavRows,
  MAX_GROUP_LENGTH,
  MAX_LABEL_LENGTH,
} from "@/lib/nav-item";
import type { NavItemRow } from "@/lib/supabase/types";

interface FormValues {
  group_label: string;
  label: string;
  href: string;
}

/**
 * 운영자용 탭 편집기 (R16 기준: 쓰기는 운영자만).
 * 이름·주소·묶음 수정, 위아래 순서 이동, 삭제, 추가를 한 화면에서 처리한다.
 */
export function NavEditor({
  items,
  hrefSuggestions,
}: {
  items: NavItemRow[];
  hrefSuggestions: string[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 공개 화면과 같은 규칙으로 묶고, 그 순서를 그대로 저장한다.
  const groups = groupNavRows(items);
  const ordered = groups.flatMap((group) => group.items);
  const groupNames = [...new Set(items.map((item) => item.group_label))];
  const positionById = new Map(ordered.map((item, index) => [item.id, index]));

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

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;

    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];

    setBusyId(ordered[index].id);
    setError(null);
    const message = await send("/api/nav/reorder", "POST", {
      ids: next.map((item) => item.id),
    });
    if (message) setError(message);
    setBusyId(null);
  }

  async function remove(item: NavItemRow) {
    setBusyId(item.id);
    setError(null);
    const message = await send(`/api/nav/${item.id}`, "DELETE");
    if (message) setError(message);
    setBusyId(null);
  }

  return (
    <div>
      {error && (
        <div className="mb-4">
          <Alert tone="warning">{error}</Alert>
        </div>
      )}

      <div className="mb-6">
        {adding ? (
          <NavItemForm
            submitLabel="추가"
            groupNames={groupNames}
            hrefSuggestions={hrefSuggestions}
            initial={{
              group_label: groupNames.at(-1) ?? "연구 소개",
              label: "",
              href: "",
            }}
            onCancel={() => setAdding(false)}
            onSubmit={async (values) => {
              const message = await send("/api/nav", "POST", values);
              if (!message) setAdding(false);
              return message;
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            + 탭 추가
          </button>
        )}
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.label}>
            <h3 className="mb-2 text-sm font-semibold text-ink-500">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item) => {
                const index = positionById.get(item.id) ?? 0;

                if (editingId === item.id) {
                  return (
                    <li key={item.id}>
                      <NavItemForm
                        submitLabel="저장"
                        groupNames={groupNames}
                        hrefSuggestions={hrefSuggestions}
                        initial={{
                          group_label: item.group_label,
                          label: item.label,
                          href: item.href,
                        }}
                        onCancel={() => setEditingId(null)}
                        onSubmit={async (values) => {
                          const message = await send(
                            `/api/nav/${item.id}`,
                            "PATCH",
                            values,
                          );
                          if (!message) setEditingId(null);
                          return message;
                        }}
                      />
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Card className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900">{item.label}</p>
                        <p className="truncate text-sm text-ink-500">{item.href}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0 || busyId !== null}
                          aria-label={`${item.label} 위로`}
                          className="rounded-md border border-surface-variant px-2 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === ordered.length - 1 || busyId !== null}
                          aria-label={`${item.label} 아래로`}
                          className="rounded-md border border-surface-variant px-2 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-40"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdding(false);
                            setEditingId(item.id);
                          }}
                          className="rounded-md border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                        >
                          이름·주소 수정
                        </button>
                        <DeleteControl
                          busy={busyId === item.id}
                          onDelete={() => remove(item)}
                        />
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/** 추가·수정 공용 폼. 성공하면 null, 실패하면 오류 문구를 돌려주는 onSubmit 을 받는다. */
function NavItemForm({
  initial,
  submitLabel,
  groupNames,
  hrefSuggestions,
  onSubmit,
  onCancel,
}: {
  initial: FormValues;
  submitLabel: string;
  groupNames: string[];
  hrefSuggestions: string[];
  onSubmit: (values: FormValues) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);
  const [newGroup, setNewGroup] = useState(
    !groupNames.includes(initial.group_label),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `nav-form-${submitLabel}`;

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
      className="space-y-4 rounded-lg border border-brand-200 bg-surface-container-lowest p-4"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="탭 이름" htmlFor={`${id}-label`} required>
          <TextInput
            id={`${id}-label`}
            value={values.label}
            maxLength={MAX_LABEL_LENGTH}
            required
            placeholder="연구 핵심소개"
            onChange={(e) => setValues({ ...values, label: e.target.value })}
          />
        </Field>

        <Field
          label="주소"
          htmlFor={`${id}-href`}
          required
          hint="사이트 내부 경로(/about) 또는 https:// 링크"
        >
          <TextInput
            id={`${id}-href`}
            value={values.href}
            list={`${id}-href-options`}
            required
            placeholder="/about"
            onChange={(e) => setValues({ ...values, href: e.target.value })}
          />
          <datalist id={`${id}-href-options`}>
            {hrefSuggestions.map((href) => (
              <option key={href} value={href} />
            ))}
          </datalist>
        </Field>

        <Field
          label="묶음"
          htmlFor={`${id}-group`}
          hint="같은 묶음끼리 메뉴에서 함께 묶입니다."
        >
          {newGroup || groupNames.length === 0 ? (
            <div className="space-y-1.5">
              <TextInput
                id={`${id}-group`}
                value={values.group_label}
                maxLength={MAX_GROUP_LENGTH}
                required
                placeholder="연구 소개"
                onChange={(e) =>
                  setValues({ ...values, group_label: e.target.value })
                }
              />
              {groupNames.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNewGroup(false);
                    setValues({ ...values, group_label: groupNames[0] });
                  }}
                  className="text-xs text-brand-700 underline"
                >
                  기존 묶음에서 고르기
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Select
                id={`${id}-group`}
                value={values.group_label}
                onChange={(e) =>
                  setValues({ ...values, group_label: e.target.value })
                }
              >
                {groupNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => {
                  setNewGroup(true);
                  setValues({ ...values, group_label: "" });
                }}
                className="text-xs text-brand-700 underline"
              >
                새 묶음 만들기
              </button>
            </div>
          )}
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "처리 중…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-surface-variant px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          취소
        </button>
      </div>
    </form>
  );
}

/** 2단계 확인 삭제 버튼 */
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
        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
      >
        삭제
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-ink-700">탭을 지울까요?</span>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {busy ? "삭제 중…" : "네"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={busy}
        className="rounded-md border border-surface-variant px-2.5 py-1 text-xs text-on-surface-variant hover:bg-surface-container-high"
      >
        아니요
      </button>
    </span>
  );
}

/** 탭이 하나도 없을 때 기본 메뉴를 한 번에 채워 넣는 버튼 */
export function SeedNavDefaults({ defaults }: { defaults: FormValues[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function seed() {
    setBusy(true);
    setError(null);
    for (const item of defaults) {
      const res = await fetch("/api/nav", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "기본 메뉴를 넣지 못했습니다.");
        setBusy(false);
        return;
      }
    }
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={seed}
        disabled={busy}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "넣는 중…" : "기본 메뉴 가져오기"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
