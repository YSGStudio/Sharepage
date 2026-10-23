import type { ResultMetric } from "@/content/results";

/** 사전·사후 비교 수치 카드 */
export function MetricCard({ metric }: { metric: ResultMetric }) {
  const hasRange = metric.before !== undefined && metric.after !== undefined;

  return (
    <div className="flex h-full flex-col rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
      <p className="text-xs font-semibold leading-snug text-on-surface-variant">
        {metric.label}
      </p>
      {hasRange && (
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-sm text-ink-500">{metric.before}</span>
          <span aria-hidden className="text-sm text-brand-300">
            →
          </span>
          <span className="sr-only">에서</span>
          <span className="text-2xl font-bold text-brand-800">{metric.after}</span>
        </p>
      )}
      <p
        className={`text-sm font-semibold text-brand-600 ${hasRange ? "mt-1" : "mt-3"}`}
      >
        {metric.change}
      </p>
    </div>
  );
}
