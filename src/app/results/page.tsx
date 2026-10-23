import type { Metadata } from "next";
import { MetricCard } from "@/components/result-metric";
import {
  Alert,
  Badge,
  Card,
  Container,
  PageHeader,
  Section,
  TableScroll,
} from "@/components/ui";
import {
  CONCLUSIONS,
  DISSEMINATION_CASES,
  KEY_METRICS,
  RESULTS_NOTICE,
  SUGGESTIONS,
  TASK_RESULTS,
  VERIFICATION_LIMIT,
  VERIFICATION_METHODS,
} from "@/content/results";

export const metadata: Metadata = {
  title: "연구 결과",
  description:
    "사전·사후 검증으로 확인한 공통과제·선택과제별 성과와 시사점, 결론 및 제언, 성과 확산 사례를 정리했습니다.",
};

export default function ResultsPage() {
  return (
    <>
      <PageHeader
        eyebrow="연구 소개"
        title="연구 결과 및 검증"
        description="사전·사후 검증으로 과제별로 무엇이 확인되었고, 무엇이 남았는지 정리했습니다."
      />

      <Container>
        <div className="mb-10">
          <Alert tone="info" title="결과보고서 기준 안내">
            {RESULTS_NOTICE}
          </Alert>
        </div>

        <Section
          title="한눈에 보는 결과"
          description="교사·학생·기초학력·생태전환교육 영역의 사전·사후 평균(5점 척도)입니다."
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {KEY_METRICS.map((metric) => (
              <li key={metric.label}>
                <MetricCard metric={metric} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="과제별 성과와 시사점">
          <div className="space-y-6">
            {TASK_RESULTS.map((result) => (
              <Card key={result.id}>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={result.kind === "공통과제" ? "brand" : "accent"}>
                    {result.kind}
                  </Badge>
                  <h2 className="text-lg font-bold text-brand-800">
                    {result.title}
                  </h2>
                </div>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result.metrics.map((metric) => (
                    <li key={metric.label}>
                      <MetricCard metric={metric} />
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-brand-600">
                      주요 성과
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {result.outcomes.map((o) => (
                        <li
                          key={o}
                          className="flex gap-2 text-sm leading-relaxed text-ink-700"
                        >
                          <span aria-hidden className="text-brand-400">
                            —
                          </span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-brand-600">
                      확인 근거
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {result.evidence.map((e) => (
                        <li
                          key={e}
                          className="flex gap-2 text-sm leading-relaxed text-ink-500"
                        >
                          <span aria-hidden className="text-brand-300">
                            —
                          </span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-brand-50 p-4">
                  <h3 className="text-xs font-semibold tracking-wide text-brand-600">
                    시사점
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-700">
                    {result.implication}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="결론">
          <ol className="space-y-3">
            {CONCLUSIONS.map((conclusion, i) => (
              <li key={conclusion} className="flex gap-3">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700"
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink-700">{conclusion}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          title="제언"
          description="연구 결과를 바탕으로 앞으로 이어 가야 할 과제입니다."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {SUGGESTIONS.map((suggestion) => (
              <Card key={suggestion.title}>
                <h3 className="text-base font-bold text-brand-800">{suggestion.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {suggestion.description}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="검증 방법"
          description="사전 검사(2026. 4.)와 사후 검사(2026. 10.)를 비교해 효과를 확인했습니다."
        >
          <TableScroll>
            <table className="w-full min-w-[36rem] border-collapse bg-white text-left text-sm">
              <thead className="bg-brand-50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-brand-800">
                    대상
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-brand-800">
                    검사 도구
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-brand-800">
                    분석 방법
                  </th>
                </tr>
              </thead>
              <tbody>
                {VERIFICATION_METHODS.map((item) => (
                  <tr key={item.target} className="border-t border-brand-100">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-ink-900">
                      {item.target}
                    </td>
                    <td className="px-4 py-3 leading-relaxed text-ink-700">
                      {item.tool}
                    </td>
                    <td className="px-4 py-3 leading-relaxed text-ink-700">
                      {item.method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
          <p className="mt-3 text-xs leading-relaxed text-ink-500">
            {VERIFICATION_LIMIT}
          </p>
        </Section>

        <Section
          title="성과 확산 사례"
          description="연구 성과를 학교 안팎으로 나눈 활동입니다."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {DISSEMINATION_CASES.map((c) => (
              <Card key={c.title}>
                <h3 className="text-base font-bold text-brand-800">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {c.description}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      </Container>
    </>
  );
}
