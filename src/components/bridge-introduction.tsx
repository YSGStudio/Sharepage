"use client";

import Image from "next/image";
import { useState } from "react";

const BRIDGE_STAGES = [
  {
    letter: "B",
    word: "BLEND",
    title: "전통–디지털 수업 결합",
    description:
      "교과서 수업과 디지털 수업을 자연스럽게 융합하여 깊이 있는 탐구 학습을 설계합니다.",
    practices: [
      "교과서의 핵심 개념과 디지털 자료를 연결합니다.",
      "도구 사용보다 배움의 목적과 탐구 질문을 먼저 세웁니다.",
      "학생 수준과 수업 장면에 맞는 온·오프라인 활동을 조합합니다.",
    ],
    theme: "border-orange-300 bg-orange-50 text-orange-700",
    active: "border-orange-500 bg-orange-500 text-white shadow-orange-200",
    dot: "bg-orange-500",
  },
  {
    letter: "R",
    word: "REORGANIZE",
    title: "수업 재조직화",
    description:
      "디지털 환경에 맞게 수업의 흐름과 구조를 재구성하고, 배움의 과정을 평가합니다.",
    practices: [
      "교육과정 성취기준을 중심으로 수업 흐름을 다시 설계합니다.",
      "학생의 탐구·협력·표현이 이어지도록 활동 순서를 조정합니다.",
      "결과뿐 아니라 학습 과정이 드러나는 평가를 구성합니다.",
    ],
    theme: "border-orange-300 bg-orange-50 text-orange-700",
    active: "border-orange-600 bg-orange-600 text-white shadow-orange-200",
    dot: "bg-orange-600",
  },
  {
    letter: "I",
    word: "INITIATIVE",
    title: "학습자 주도성",
    description:
      "학생이 책임 있게 선택하고 행동하는 주도적인 디지털 리더로 성장하도록 돕습니다.",
    practices: [
      "학생이 탐구 질문과 해결 방법을 스스로 선택합니다.",
      "개인별 역할과 책임이 분명한 협력 활동을 운영합니다.",
      "자기평가와 성찰을 통해 다음 학습을 스스로 계획합니다.",
    ],
    theme: "border-orange-400 bg-orange-50 text-orange-800",
    active: "border-orange-600 bg-orange-600 text-white shadow-orange-200",
    dot: "bg-orange-600",
  },
  {
    letter: "D",
    word: "DEVELOP",
    title: "학습 확장",
    description:
      "AI·디지털 기반의 창의·융합 탐구 활동을 통해 교실 밖으로 배움을 확장합니다.",
    practices: [
      "AI와 디지털 도구로 자료를 수집하고 분석합니다.",
      "여러 교과의 지식과 기능을 연결해 해결안을 만듭니다.",
      "다양한 디지털 산출물로 생각과 발견을 표현합니다.",
    ],
    theme: "border-red-300 bg-red-50 text-red-700",
    active: "border-red-600 bg-red-600 text-white shadow-red-200",
    dot: "bg-red-600",
  },
  {
    letter: "G",
    word: "GROW",
    title: "교사–학생 공동 성장",
    description:
      "교사와 학생이 함께 디지털 역량과 학습 역량을 키우며 수업을 발전시킵니다.",
    practices: [
      "교사는 수업 사례를 나누고 함께 개선합니다.",
      "학생의 피드백과 성장을 다음 수업 설계에 반영합니다.",
      "교사와 학생 모두 디지털 시민성과 활용 역량을 기릅니다.",
    ],
    theme: "border-rose-300 bg-rose-50 text-rose-800",
    active: "border-rose-700 bg-rose-700 text-white shadow-rose-200",
    dot: "bg-rose-700",
  },
  {
    letter: "E",
    word: "ENRICH",
    title: "배움 확장·일반화",
    description:
      "배움이 학교 전체의 문화로 정착하고 가정과 지역사회로 확산되도록 합니다.",
    practices: [
      "수업 결과와 학생 산출물을 함께 나누고 축적합니다.",
      "학교 구성원이 실천 사례를 공유하는 문화를 만듭니다.",
      "가정·지역·다른 학교와 연결해 배움의 영향력을 넓힙니다.",
    ],
    theme: "border-red-300 bg-red-50 text-red-900",
    active: "border-red-900 bg-red-900 text-white shadow-red-200",
    dot: "bg-red-900",
  },
] as const;

export function BridgeIntroduction() {
  const [selected, setSelected] = useState(0);
  const stage = BRIDGE_STAGES[selected];

  return (
    <section aria-labelledby="bridge-model-title" className="mb-14">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-orange-50 shadow-[0_20px_60px_rgba(0,108,73,0.08)]">
        <div className="grid items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-sm">
            <Image
              src="/images/bridge-logo.png"
              width={1058}
              height={1086}
              priority
              alt="다리와 BRIDGE 여섯 글자로 구성된 BRIDGE 교수·학습 모델 로고"
              className="h-auto w-full drop-shadow-[0_16px_24px_rgba(0,108,73,0.12)]"
              sizes="(max-width: 1024px) 22rem, 28vw"
            />
          </div>

          <div>
            <p className="text-xs font-black tracking-[0.2em] text-emerald-700">BRIDGE LEARNING MODEL</p>
            <h2 id="bridge-model-title" className="mt-3 text-2xl font-black leading-tight text-on-surface sm:text-3xl">
              배움과 성장을 연결하는
              <span className="block bg-gradient-to-r from-orange-500 to-red-700 bg-clip-text text-transparent">6가지 수업의 다리</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
              BRIDGE의 각 글자에는 서울언남초등학교가 만들어 갈 수업 혁신의 방향이 담겨 있습니다. 아래 글자를 선택해 단계별 의미와 실천 내용을 확인해 보세요.
            </p>

            <div aria-label="BRIDGE 단계 선택" className="mt-7 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {BRIDGE_STAGES.map((item, index) => {
                const active = selected === index;
                return (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-pressed={active}
                    aria-controls="bridge-stage-panel"
                    className={`group rounded-xl border px-2 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-offset-2 ${active ? `${item.active} shadow-lg` : item.theme}`}
                  >
                    <span className="block text-2xl font-black leading-none">{item.letter}</span>
                    <span className="mt-1.5 block truncate text-[9px] font-black tracking-wide sm:text-[10px]">{item.word}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div id="bridge-stage-panel" aria-live="polite" className="border-t border-emerald-100 bg-white/85 px-5 py-7 sm:px-8 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="flex gap-4">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg ${stage.dot}`}>
                {stage.letter}
              </span>
              <div>
                <p className="text-xs font-black tracking-[0.14em] text-on-surface-variant">{stage.word}</p>
                <h3 className="mt-1 text-xl font-black text-on-surface">{stage.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-700">{stage.description}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-5">
              <p className="text-xs font-bold tracking-wide text-on-surface-variant">수업에서 이렇게 실천합니다</p>
              <ul className="mt-3 space-y-3">
                {stage.practices.map((practice) => (
                  <li key={practice} className="flex gap-3 text-sm leading-relaxed text-ink-700">
                    <span aria-hidden className={`mt-2 h-2 w-2 shrink-0 rounded-full ${stage.dot}`} />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <details className="group mt-6 overflow-hidden rounded-2xl border border-surface-variant bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-on-surface [&::-webkit-details-marker]:hidden">
          BRIDGE 모델 전체 설명 이미지 보기
          <span aria-hidden className="text-xl text-brand-600 transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="border-t border-surface-variant bg-surface-container-low p-3 sm:p-5">
          <Image
            src="/images/bridge-explanation.png"
            width={1360}
            height={724}
            alt="BRIDGE 모델의 B Blend, R Reorganize, I Initiative, D Develop, G Grow, E Enrich 여섯 요소 설명"
            className="h-auto w-full rounded-xl bg-white"
            sizes="(max-width: 1024px) 100vw, 75vw"
          />
        </div>
      </details>
    </section>
  );
}
