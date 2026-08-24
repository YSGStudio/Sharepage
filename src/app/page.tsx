import Link from "next/link";
import { Card, Container, Section } from "@/components/ui";
import { BRIDGE_STAGES } from "@/content/bridge";
import { RESEARCH_OVERVIEW, RESEARCH_PHASES } from "@/content/research";

const ENTRY_POINTS = [
  {
    href: "/about",
    title: "연구 핵심소개",
    body: "무엇을, 왜, 어떤 절차로 연구하는지 한 페이지로 확인합니다.",
    number: "01",
  },
  {
    href: "/model",
    title: "BRIDGE 모델",
    body: "6단계 수업 모델의 정의와 학생 주도성 요소를 자세히 봅니다.",
    number: "02",
  },
  {
    href: "/timeline",
    title: "월별 추진현황",
    body: "2월부터 이듬해 1월까지 매달의 활동을 시간 순으로 봅니다.",
    number: "03",
  },
  {
    href: "/results",
    title: "연구 결과",
    body: "과제별 성과와 시사점, 검증 계획과 확산 사례를 봅니다.",
    number: "04",
  },
];

const SHARE_POINTS = [
  {
    href: "/lesson-plan",
    title: "BRIDGE 지도안 만들기",
    body: "학년·과목·성취기준을 넣으면 BRIDGE 6단계 지도안 초안을 만들어 드립니다. 로그인 없이 바로 쓰고 내려받을 수 있습니다.",
    cta: "지도안 만들기",
    primary: true,
  },
  {
    href: "/materials",
    title: "수업자료 나눔",
    body: "선생님들이 올린 BRIDGE 수업자료를 학년·과목별로 찾아 내려받을 수 있습니다.",
    cta: "자료 보러 가기",
  },
  {
    href: "/gallery",
    title: "운영 사진",
    body: "수업 나눔, 프로젝트 발표, 연수 현장의 기록입니다.",
    cta: "갤러리 보기",
  },
  {
    href: "/testimonials",
    title: "학부모·학생 소감",
    body: "연구학교 수업을 겪은 학생과 학부모의 이야기입니다. 소감을 남길 수도 있습니다.",
    cta: "소감 보기",
  },
];

export default function Home() {
  return (
    <>
      {/* 히어로 */}
      <section className="border-b border-surface-variant bg-surface-container-lowest">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_360px] lg:items-end lg:px-10 lg:py-24">
          <div>
            <p className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-brand-700">
              {RESEARCH_OVERVIEW.school} 연구학교 · {RESEARCH_OVERVIEW.period}
            </p>
            <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-[1.3] tracking-[-0.02em] text-on-surface sm:text-4xl lg:text-5xl lg:leading-[1.25]">
              AI·디지털로 학생이 주도하는
              <br className="hidden sm:block" /> 배움의 새로운 기준을 만듭니다
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-on-surface-variant sm:text-lg">
              {RESEARCH_OVERVIEW.summary}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-500 active:scale-95"
              >
                연구 살펴보기
              </Link>
              <Link
                href="/lesson-plan"
                className="rounded-xl border border-primary bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-brand-50 active:scale-95"
              >
                BRIDGE 지도안 만들기
              </Link>
            </div>
          </div>
          <aside
            className="border-l-2 border-primary pl-6 lg:mb-1"
            aria-label="연구 핵심 수치"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              Research at a glance
            </p>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div>
                <strong className="block text-3xl font-bold tabular-nums text-primary">6</strong>
                <span className="mt-1 block text-xs text-on-surface-variant">BRIDGE 단계</span>
              </div>
              <div>
                <strong className="block text-3xl font-bold tabular-nums text-primary">4</strong>
                <span className="mt-1 block text-xs text-on-surface-variant">연구 절차</span>
              </div>
              <div>
                <strong className="block text-3xl font-bold tabular-nums text-primary">12</strong>
                <span className="mt-1 block text-xs text-on-surface-variant">운영 개월</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Container>
        {/* BRIDGE 6단계 요약 */}
        <Section
          title="BRIDGE 6단계"
          description="한 단원 안에서 여섯 단계가 모두 나타나도록 수업을 설계합니다."
        >
          <ol className="grid overflow-hidden rounded-lg border border-surface-variant bg-white sm:grid-cols-2 lg:grid-cols-3">
            {BRIDGE_STAGES.map((stage) => (
              <li
                key={stage.letter}
                className="border-b border-surface-variant last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
              >
                <Link
                  href={`/model#${stage.letter}`}
                  className="flex h-full items-start gap-3 p-5 transition-colors duration-200 hover:bg-surface-container-low"
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary text-lg font-bold text-white"
                  >
                    {stage.letter}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-on-surface">
                      {stage.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-on-surface-variant">
                      {stage.korean}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Section>

        {/* 연구 둘러보기 */}
        <Section title="연구 둘러보기">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ENTRY_POINTS.map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <Card className="relative h-full transition-all duration-200 group-hover:border-outline group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <span className="text-xs font-semibold tracking-widest text-primary">
                    {item.number}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {item.body}
                  </p>
                  <span className="mt-5 inline-block text-sm font-medium text-primary">
                    바로가기 →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </Section>

        {/* 함께 나누기 */}
        <Section
          title="함께 나누기"
          description="연구 성과는 자료로 남을 때 확산됩니다. 선생님과 방문자가 함께 채워 갑니다."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {SHARE_POINTS.map((item) => (
              <Card
                key={item.href}
                className={
                  item.primary ? "border-brand-200 bg-brand-50" : undefined
                }
              >
                <h3 className="text-lg font-semibold text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className={`mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    item.primary
                      ? "bg-primary text-white hover:bg-brand-500"
                      : "border border-primary text-primary hover:bg-brand-50"
                  }`}
                >
                  {item.cta}
                </Link>
              </Card>
            ))}
          </div>
        </Section>

        {/* 연구 절차 */}
        <Section title="연구 절차">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RESEARCH_PHASES.map((phase) => (
              <li key={phase.order}>
                <Card className="h-full">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {phase.order}
                    </span>
                    <span className="text-base font-semibold text-on-surface">
                      {phase.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-on-surface-variant">
                    {phase.period}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
          <p className="mt-4">
            <Link
              href="/timeline"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              월별 추진현황 자세히 보기 →
            </Link>
          </p>
        </Section>
      </Container>
    </>
  );
}
