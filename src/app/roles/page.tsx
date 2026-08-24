import type { Metadata } from "next";
import { Alert, Container, PageHeader, Section } from "@/components/ui";
import { DIVISIONS, SUPPORT_BODIES } from "@/content/organization";

export const metadata: Metadata = {
  title: "교원별 역할",
  description:
    "연구·기획, 교육과정개발, 연구운영팀, 지원관리 및 평가, 홍보·연수 5개 분과의 담당 업무와 담당 교원을 소개합니다.",
};

const divisionThemes = {
  planning: {
    card: "border-blue-200 bg-blue-50/60",
    icon: "bg-blue-600 text-white shadow-blue-200",
    label: "text-blue-700",
    bullet: "bg-blue-500",
    member: "border-blue-200 bg-white text-blue-800",
    number: "text-blue-200",
  },
  curriculum: {
    card: "border-emerald-200 bg-emerald-50/60",
    icon: "bg-emerald-600 text-white shadow-emerald-200",
    label: "text-emerald-700",
    bullet: "bg-emerald-500",
    member: "border-emerald-200 bg-white text-emerald-800",
    number: "text-emerald-200",
  },
  operation: {
    card: "border-violet-200 bg-violet-50/60",
    icon: "bg-violet-600 text-white shadow-violet-200",
    label: "text-violet-700",
    bullet: "bg-violet-500",
    member: "border-violet-200 bg-white text-violet-800",
    number: "text-violet-200",
  },
  evaluation: {
    card: "border-amber-200 bg-amber-50/70",
    icon: "bg-amber-500 text-white shadow-amber-200",
    label: "text-amber-800",
    bullet: "bg-amber-500",
    member: "border-amber-200 bg-white text-amber-900",
    number: "text-amber-200",
  },
  outreach: {
    card: "border-rose-200 bg-rose-50/60",
    icon: "bg-rose-600 text-white shadow-rose-200",
    label: "text-rose-700",
    bullet: "bg-rose-500",
    member: "border-rose-200 bg-white text-rose-800",
    number: "text-rose-200",
  },
} as const;

function DivisionIcon({ id }: { id: string }) {
  const paths: Record<string, React.ReactNode> = {
    planning: <path d="M4 19.5V6.75A2.25 2.25 0 0 1 6.25 4.5h11.5A2.25 2.25 0 0 1 20 6.75V19.5M8 4.5V3m8 1.5V3M7 9h10M8 13h3m-3 3h6" />,
    curriculum: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm16 0A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />,
    operation: <path d="m9 12 2 2 4-5m6 3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    evaluation: <path d="M5 20V10m7 10V4m7 16v-7M3 20h18" />,
    outreach: <path d="M4 13v-2l12-5v12L4 13Zm12-3 3-1v6l-3-1M6 14l1 5h4l-1-4" />,
  };

  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-none stroke-current stroke-[1.8]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[id]}
    </svg>
  );
}

export default function RolesPage() {
  return (
    <>
      <PageHeader
        eyebrow="연구 소개"
        title="교원별 역할"
        description="학교 구성원이 하나의 연구 목표를 향해 움직입니다. 운영 조직의 흐름과 5개 실행 분과의 역할을 한눈에 확인해 보세요."
      />

      <Container>
        <Section className="mb-16">
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50/60 px-4 py-8 shadow-[0_12px_40px_rgba(0,39,111,0.06)] sm:px-8 lg:px-10">
            <div className="text-center">
              <p className="text-xs font-bold tracking-[0.18em] text-brand-600">ORGANIZATION</p>
              <h2 className="mt-2 text-2xl font-bold text-on-surface">연구 운영 조직도</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                방향을 세우고 함께 결정한 뒤, 다섯 분과가 전문 영역을 나누어 실행합니다.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-brand-200 bg-white p-5 text-center shadow-lg shadow-brand-100/60">
              <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">총괄 · 지원</span>
              <h3 className="mt-2 text-xl font-bold text-brand-900">{SUPPORT_BODIES[0].name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{SUPPORT_BODIES[0].role}</p>
            </div>

            <div aria-hidden className="mx-auto h-8 w-px bg-brand-300" />

            <div className="mx-auto max-w-lg rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-[1px] shadow-lg shadow-brand-200/60">
              <div className="rounded-[15px] bg-white px-6 py-5 text-center">
                <span className="text-xs font-bold tracking-wide text-brand-600">기획 · 조정</span>
                <h3 className="mt-1 text-xl font-bold text-on-surface">{SUPPORT_BODIES[1].name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{SUPPORT_BODIES[1].role}</p>
              </div>
            </div>

            <div className="relative mx-auto h-12 max-w-5xl">
              <div aria-hidden className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-brand-300" />
              <div aria-hidden className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-brand-300 lg:block" />
              <div aria-hidden className="absolute left-[10%] top-6 hidden h-6 w-px bg-brand-300 lg:block" />
              <div aria-hidden className="absolute left-[30%] top-6 hidden h-6 w-px bg-brand-300 lg:block" />
              <div aria-hidden className="absolute left-1/2 top-6 hidden h-6 w-px bg-brand-300 lg:block" />
              <div aria-hidden className="absolute left-[70%] top-6 hidden h-6 w-px bg-brand-300 lg:block" />
              <div aria-hidden className="absolute left-[90%] top-6 hidden h-6 w-px bg-brand-300 lg:block" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {DIVISIONS.map((division, index) => {
                const theme = divisionThemes[division.id as keyof typeof divisionThemes];

                return (
                  <article key={division.id} className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md ${theme.card}`}>
                    <span aria-hidden className={`absolute right-3 top-1 text-5xl font-black ${theme.number}`}>{String(index + 1).padStart(2, "0")}</span>
                    <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${theme.icon}`}>
                      <DivisionIcon id={division.id} />
                    </div>
                    <p className={`mt-4 text-[11px] font-bold tracking-[0.14em] ${theme.label}`}>실행 분과 {index + 1}</p>
                    <h3 className="mt-1 min-h-14 text-lg font-bold leading-snug text-on-surface">{division.name}</h3>
                    <p className="mt-2 min-h-16 text-sm leading-relaxed text-ink-500">{division.mission}</p>

                    <div className="mt-4 border-t border-black/10 pt-4">
                      <p className={`text-xs font-bold ${theme.label}`}>핵심 업무</p>
                      <ul className="mt-3 space-y-2.5">
                        {division.duties.map((duty) => (
                          <li key={duty} className="flex gap-2 text-[13px] leading-relaxed text-ink-700">
                            <span aria-hidden className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${theme.bullet}`} />
                            <span>{duty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 border-t border-black/10 pt-4">
                      <p className={`text-xs font-bold ${theme.label}`}>담당 교원</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {division.members.map((member) => (
                          <li key={member} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${theme.member}`}>
                            {member}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="전문 자문 체계" description="교내 운영 조직과 외부 전문가가 함께 연구의 완성도를 높입니다.">
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5 sm:flex sm:items-center sm:gap-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white shadow-lg shadow-violet-200">+</div>
            <div className="mt-3 sm:mt-0">
              <h3 className="text-lg font-bold text-violet-900">{SUPPORT_BODIES[2].name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">{SUPPORT_BODIES[2].role}</p>
            </div>
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
