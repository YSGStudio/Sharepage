import type { Metadata } from "next";
import { Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import { PHASE_DESCRIPTIONS, TIMELINE, type PhaseName } from "@/content/timeline";

export const metadata: Metadata = {
  title: "월별 추진현황",
  description:
    "2026년 2월부터 2027년 1월까지 계획·실행·결과분석·일반화 4단계의 월별 추진 활동을 정리했습니다.",
};

const PHASE_STYLES: Record<PhaseName, string> = {
  계획: "bg-brand-100 text-brand-700 border-brand-200",
  실행: "bg-accent-100 text-accent-700 border-accent-300",
  결과분석: "bg-slate-100 text-ink-700 border-slate-200",
  일반화: "bg-brand-600 text-white border-brand-600",
};

export default function TimelinePage() {
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

        <Section title="월별 추진 활동">
          <ol className="relative border-l-2 border-brand-100 pl-5 sm:pl-8">
            {TIMELINE.map((item) => (
              <li key={`${item.yearLabel}-${item.month}`} className="mb-8 last:mb-0">
                <span
                  aria-hidden
                  className="absolute -left-[9px] mt-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-brand-500"
                />
                <Card>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-base font-bold text-brand-800">
                      {item.yearLabel}년 {item.month}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PHASE_STYLES[item.phase]}`}
                    >
                      {item.phase}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink-900">
                    {item.headline}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {item.activities.map((act) => (
                      <li
                        key={act}
                        className="flex gap-2 text-sm leading-relaxed text-ink-700"
                      >
                        <span aria-hidden className="text-brand-400">
                          —
                        </span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
        </Section>

        <div className="flex flex-wrap gap-2">
          <Badge>전체 12개월</Badge>
          <Badge tone="muted">2026. 2. ~ 2027. 1.</Badge>
        </div>
      </Container>
    </>
  );
}
