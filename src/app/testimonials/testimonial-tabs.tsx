"use client";

import { useState } from "react";
import { Alert, Badge, Card } from "@/components/ui";
import {
  AUTHOR_BADGE_TONES,
  AUTHOR_TYPE_LABELS,
  AUTHOR_TYPES,
  type AuthorType,
  type Testimonial,
} from "@/lib/supabase/types";

/** 공개된 소감을 학생·학부모·교사 탭으로 나눠 그리드로 보여 준다. */
export function TestimonialTabs({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState<AuthorType>("student");
  const visible = testimonials.filter((t) => t.author_type === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="작성자 구분"
        className="flex gap-1 border-b border-surface-variant"
      >
        {AUTHOR_TYPES.map((type) => {
          const selected = type === active;
          const count = testimonials.filter((t) => t.author_type === type).length;
          return (
            <button
              key={type}
              type="button"
              role="tab"
              id={`tab-${type}`}
              aria-selected={selected}
              aria-controls={`panel-${type}`}
              onClick={() => setActive(type)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                selected
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}
            >
              {AUTHOR_TYPE_LABELS[type]}
              <span className="ml-1.5 text-xs font-medium text-ink-500">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="mt-6"
      >
        {visible.length === 0 ? (
          <Alert tone="info">
            아직 공개된 {AUTHOR_TYPE_LABELS[active]} 소감이 없습니다. 첫 소감을 남겨 주세요.
          </Alert>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {visible.map((t) => (
              <li key={t.id} className="flex">
                <Card className="flex w-full flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={AUTHOR_BADGE_TONES[t.author_type]}>
                      {AUTHOR_TYPE_LABELS[t.author_type]}
                    </Badge>
                    <span className="text-sm font-medium text-ink-900">
                      {t.author_name || "익명"}
                    </span>
                    <span className="text-xs text-ink-500">
                      {new Date(t.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                    {t.content}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
