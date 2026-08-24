import type { Metadata } from "next";
import { Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import {
  AGENCY_ELEMENTS,
  BRIDGE_PRINCIPLES,
  BRIDGE_STAGES,
} from "@/content/bridge";

export const metadata: Metadata = {
  title: "BRIDGE 모델",
  description:
    "문제해결모형과 프로젝트학습법을 통합한 BRIDGE 교수·학습 모델 6단계와 학생 주도성 요소를 소개합니다.",
};

export default function ModelPage() {
  return (
    <>
      <PageHeader
        eyebrow="연구 소개"
        title="BRIDGE 교수·학습 모델"
        description="문제해결모형과 프로젝트학습법을 통합한 학교 단위 수업 전환 모델입니다. 여섯 단계를 거치며 학생이 스스로 묻고, 탐구하고, 만들고, 나누고, 돌아봅니다."
      />

      <Container>
        <Section title="6단계 한눈에 보기">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BRIDGE_STAGES.map((stage) => (
              <li key={stage.letter}>
                <a
                  href={`#${stage.letter}`}
                  className="flex h-full items-start gap-3 rounded-xl border border-brand-100 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white"
                  >
                    {stage.letter}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-brand-800">
                      {stage.name}
                    </span>
                    <span className="block text-sm text-ink-500">
                      {stage.korean}
                    </span>
                    <span className="mt-1 block text-xs text-ink-500">
                      {stage.group}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          title="단계별 상세"
          description="각 단계의 목적, 교사의 역할, 학생 활동, 디지털 도구의 쓰임을 정리했습니다."
        >
          <div className="space-y-6">
            {BRIDGE_STAGES.map((stage) => (
              <Card key={stage.letter} className="scroll-mt-24" >
                <div id={stage.letter} className="scroll-mt-24">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xl font-bold text-white"
                    >
                      {stage.letter}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-brand-800">
                        {stage.name}
                        <span className="ml-2 text-base font-medium text-ink-500">
                          {stage.korean}
                        </span>
                      </h3>
                      <p className="text-xs text-ink-500">{stage.group}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:ml-auto">
                      {stage.agency.map((a) => (
                        <Badge key={a} tone="accent">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-ink-700">
                    {stage.purpose}
                  </p>

                  <dl className="mt-4 grid gap-4 border-t border-brand-100 pt-4 sm:grid-cols-3">
                    {[
                      ["교사의 역할", stage.teacherRole],
                      ["학생 활동", stage.studentActivity],
                      ["디지털 도구의 쓰임", stage.digitalUse],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-semibold text-brand-600">
                          {label}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-ink-700">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="학생 주도성 4요소"
          description="BRIDGE의 각 단계는 아래 네 요소 중 하나 이상을 명시적으로 키우도록 설계합니다."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {AGENCY_ELEMENTS.map((el) => (
              <Card key={el.name}>
                <h3 className="text-base font-bold text-brand-800">{el.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {el.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {el.stages.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="운영 원칙">
          <div className="grid gap-5 sm:grid-cols-2">
            {BRIDGE_PRINCIPLES.map((p) => (
              <Card key={p.title}>
                <h3 className="text-base font-bold text-brand-800">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {p.body}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      </Container>
    </>
  );
}
