import type { Metadata } from "next";
import { Alert, Card, Container, PageHeader, Section } from "@/components/ui";
import { DIVISIONS, SUPPORT_BODIES } from "@/content/organization";

export const metadata: Metadata = {
  title: "교원별 역할",
  description:
    "연구·기획, 교육과정개발, 연구운영팀, 지원관리 및 평가, 홍보·연수 5개 분과의 담당 업무와 담당 교원을 소개합니다.",
};

export default function RolesPage() {
  return (
    <>
      <PageHeader
        eyebrow="연구 소개"
        title="교원별 역할"
        description="연구는 5개 분과가 나누어 맡습니다. 분과별 담당 업무와 담당 교원은 다음과 같습니다."
      />

      <Container>
        <Section>
          <div className="grid gap-5 lg:grid-cols-2">
            {DIVISIONS.map((division) => (
              <Card key={division.id} className="flex flex-col">
                <h2 className="text-lg font-bold text-brand-800">
                  {division.name}
                </h2>
                <p className="mt-1 text-sm text-ink-500">{division.mission}</p>

                <h3 className="mt-4 text-xs font-semibold tracking-wide text-brand-600">
                  담당 업무
                </h3>
                <ul className="mt-2 space-y-2">
                  {division.duties.map((duty) => (
                    <li
                      key={duty}
                      className="flex gap-2 text-sm leading-relaxed text-ink-700"
                    >
                      <span aria-hidden className="text-brand-400">
                        —
                      </span>
                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-brand-100 pt-4">
                  <h3 className="text-xs font-semibold tracking-wide text-brand-600">
                    담당 교원
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {division.members.map((member) => (
                      <li
                        key={member}
                        className="rounded-full bg-brand-50 px-3 py-1 text-sm text-ink-700"
                      >
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="지원 조직">
          <div className="grid gap-4 sm:grid-cols-3">
            {SUPPORT_BODIES.map((body) => (
              <Card key={body.name}>
                <h3 className="text-base font-bold text-brand-800">
                  {body.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {body.role}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Alert tone="info" title="담당자 표기 안내">
          이 페이지는 공개 사이트임을 고려해 담당 교원의 성명을 이니셜로
          표기합니다.
        </Alert>
      </Container>
    </>
  );
}
