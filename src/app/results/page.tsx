import type { Metadata } from "next";
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
  DISSEMINATION_CASES,
  RESULTS_NOTICE,
  TASK_RESULTS,
  VERIFICATION_PLAN,
} from "@/content/results";

export const metadata: Metadata = {
  title: "연구 결과",
  description:
    "공통과제·선택과제별 성과와 시사점, 검증 계획, 성과 확산 사례를 정리했습니다.",
};

export default function ResultsPage() {
  return (
    <>
      <PageHeader
        eyebrow="연구 소개"
        title="연구 결과 및 검증"
        description="과제별로 무엇을 했고, 무엇이 확인되었으며, 무엇이 남았는지 정리했습니다."
      />

      <Container>
        <div className="mb-10">
          <Alert tone="warning" title="중간 성과 안내">
            {RESULTS_NOTICE}
          </Alert>
        </div>

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

        <Section
          title="검증 계획"
          description="연구의 효과는 학생·교사·학부모 세 축에서 사전·사후로 확인합니다."
        >
          <TableScroll>
            <table className="w-full min-w-[36rem] border-collapse bg-white text-left text-sm">
              <thead className="bg-brand-50">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-brand-800">
                    대상
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-brand-800">
                    검증 방법
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-brand-800">
                    시기
                  </th>
                </tr>
              </thead>
              <tbody>
                {VERIFICATION_PLAN.map((item) => (
                  <tr key={item.target} className="border-t border-brand-100">
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {item.target}
                    </td>
                    <td className="px-4 py-3 leading-relaxed text-ink-700">
                      {item.method}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                      {item.timing}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
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
