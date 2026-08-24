---
name: Academic Excellence Framework
version: 2.0
source: ScholarPulse (Dashboard / Archive / Presentation Mode)
colors:
  # --- Surface ---
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  surface-variant: '#e1e3e4'
  surface-tint: '#1353d8'
  on-surface: '#191c1d'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  background: '#f8f9fa'
  on-background: '#191c1d'
  # --- Outline ---
  outline: '#737686'
  outline-variant: '#c3c5d7'
  # --- Primary (Institutional Blue) ---
  primary: '#003fb1'
  on-primary: '#ffffff'
  primary-container: '#1a56db'
  on-primary-container: '#d4dcff'
  inverse-primary: '#b5c4ff'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003dab'
  # --- Secondary (Achievement Green) ---
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  # --- Tertiary (Accent Amber) ---
  tertiary: '#694100'
  on-tertiary: '#ffffff'
  tertiary-container: '#895600'
  on-tertiary-container: '#ffd6a8'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  # --- Error ---
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
typography:
  display-lg:        { fontFamily: Noto Sans, fontSize: 48px, fontWeight: '700', lineHeight: 60px, letterSpacing: -0.02em }
  headline-lg:       { fontFamily: Noto Sans, fontSize: 32px, fontWeight: '700', lineHeight: 40px, letterSpacing: -0.01em }
  headline-lg-mobile:{ fontFamily: Noto Sans, fontSize: 24px, fontWeight: '700', lineHeight: 32px }
  headline-md:       { fontFamily: Noto Sans, fontSize: 24px, fontWeight: '600', lineHeight: 32px }
  title-lg:          { fontFamily: Noto Sans, fontSize: 20px, fontWeight: '600', lineHeight: 28px }
  body-lg:           { fontFamily: Noto Sans, fontSize: 18px, fontWeight: '400', lineHeight: 28px }
  body-md:           { fontFamily: Noto Sans, fontSize: 16px, fontWeight: '400', lineHeight: 24px }
  label-md:          { fontFamily: Noto Sans, fontSize: 14px, fontWeight: '500', lineHeight: 20px, letterSpacing: 0.01em }
  caption:           { fontFamily: Noto Sans, fontSize: 12px, fontWeight: '400', lineHeight: 16px }
rounded:
  sm: 2px
  DEFAULT: 4px
  lg: 8px
  xl: 12px
  pill: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  max-width: 1280px
elevation:
  flat: none
  raised: 0px 4px 20px rgba(0, 0, 0, 0.05)
---

# Academic Excellence Framework

연구 성과 공유 플랫폼(ScholarPulse)을 위한 디자인 시스템입니다. 교원·연구자·학사 행정 담당자를 사용자로 상정하며, 브랜드 성격은 **권위 있고, 지적이며, 투명한** 것을 지향합니다.

시각 언어는 **정제된 미니멀리즘(Refined Minimalism)** 입니다. 정보 밀도를 유지하되 어수선하지 않게, 넉넉한 여백으로 데이터 중심 작업의 인지 부하를 낮춥니다. 목표하는 정서는 "조용한 자신감"입니다. 플랫폼은 콘텐츠 앞에 나서지 않고, 학술적 성취를 돋보이게 하는 구조적이고 격식 있는 배경 역할을 합니다.

---

## 0. 적용 전 반드시 확인할 것 (Migration Notes)

기존 코드베이스에서 발견된 불일치 사항입니다. 새 프로젝트에 적용할 때 아래 기준을 따르세요.

### 0.1 `borderRadius` 매핑이 깨져 있었습니다

기존 Tailwind 설정은 다음과 같았습니다.

```js
// ❌ 기존 (깨진 상태)
borderRadius: { DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem" }
```

`rounded-full`이 `9999px`가 아니라 `12px`로 재정의되어 있어, **알약(pill) 모양을 의도한 배지·검색 입력창·아바타가 모두 둥근 사각형으로 렌더링**됩니다. 스크린샷의 "Breakthrough Research" 배지와 상단 검색창이 그 결과입니다. 아바타 이미지도 `rounded-full`로 원형을 의도했으나 실제로는 12px 라운드 사각형입니다.

아래 스케일로 교체하세요.

```js
// ✅ 수정
borderRadius: {
  sm: "2px",      // 체크박스, 마이크로 요소
  DEFAULT: "4px", // 입력 필드, 작은 버튼
  lg: "8px",      // 카드, 배지, 패널
  xl: "12px",     // 내비 아이템, 강조 버튼
  full: "9999px", // 아바타, 알약 배지, 검색창
}
```

교체 시 마크업도 함께 옮겨야 합니다. `rounded-lg`(구 4px) → `rounded`, `rounded-xl`(구 8px) → `rounded-lg`, 원형 의도였던 `rounded-full`은 그대로 두면 이제 정상 동작합니다.

### 0.2 파란색이 두 개 섞여 있습니다

| 실제 사용처 | 기존 클래스 | 값 |
|---|---|---|
| "New Achievement" 사이드바 버튼 | `bg-primary-container` | `#1a56db` |
| "Launch Presentation Mode" 버튼 | `bg-primary` | `#003fb1` |
| 페이지네이션 활성 페이지 | `bg-primary` | `#003fb1` |
| 발표 모드 "다음 슬라이드" 버튼 | `bg-primary` | `#003fb1` |

같은 위계의 주요 액션에 두 가지 파랑이 쓰이고 있습니다. **모든 주요 액션은 `primary`(`#003fb1`)로 통일**하고, `primary-container`(`#1a56db`)는 강조 배경 블록 전용으로 한정하세요. 기존 문서 산문에 적혀 있던 "Primary: #1A56DB"는 토큰 교체 이전의 잔재입니다.

### 0.3 산문 설명과 토큰 값 불일치

기존 문서에 서술된 `#10B981`(Green), `#F59E0B`(Amber), `#111827`(Text), `#E5E7EB`(Border)는 **현재 토큰에 존재하지 않습니다.** 실제 값은 각각 `secondary #006c49`, `tertiary #694100`, `on-surface #191c1d`, `surface-variant #e1e3e4`입니다. 이 문서의 front matter가 단일 진실 공급원(single source of truth)입니다.

### 0.4 레이아웃 정렬 문제

`TopAppBar`에 `max-w-max-width mx-auto`가 적용되어 있는데, 부모가 이미 `md:ml-64`로 사이드바만큼 밀려 있습니다. 결과적으로 헤더의 중앙 정렬 기준이 본문과 어긋납니다. 헤더는 전체 너비를 채우고, **내부 컨테이너**에만 `max-w-max-width`를 적용하세요.

### 0.5 배지 오버플로

대시보드의 "Latest Achievements" 목록에서 `Grant Award` 배지가 제목 텍스트와 겹칩니다. 배지에 `shrink-0`, 제목에 `min-w-0`를 주고 `flex items-start gap-sm`으로 감싸세요.

---

## 1. Colors

팔레트의 중심은 **Institutional Blue `#003fb1`** 로, 안정성과 기관의 권위를 나타냅니다. 주요 액션, 내비게이션 활성 상태, 브랜드 접점에 사용합니다.

### 1.1 역할별 사용 규칙

| 역할 | 토큰 | 값 | 용도 |
|---|---|---|---|
| Primary | `primary` | `#003fb1` | 주요 버튼, 활성 내비, 링크, 브랜드 워드마크 |
| Primary Container | `primary-container` | `#1a56db` | 강조 배경 블록 (텍스트는 `on-primary-container`) |
| Secondary | `secondary` | `#006c49` | 성취·완료·긍정 지표, "Peer Reviewed" 배지 |
| Tertiary | `tertiary` | `#694100` | 진행 중·주의 상태, "Grant Award" 배지 |
| Error | `error` | `#ba1a1a` | 파괴적 액션, 검증 실패 |
| Page BG | `background` | `#f8f9fa` | 페이지 바탕 |
| Card BG | `surface-container-lowest` | `#ffffff` | 카드·패널 |
| Border | `surface-variant` | `#e1e3e4` | 카드 경계선 |
| Divider | `outline-variant` | `#c3c5d7` | 구분선, 입력 필드 테두리 |
| Body Text | `on-surface` | `#191c1d` | 본문·제목 |
| Muted Text | `on-surface-variant` | `#434654` | 보조 설명, 메타데이터 |

### 1.2 배경 위계

흰색 카드가 회색 배경 위에 놓이는 2단 구조가 기본입니다. `surface-container-*` 계열은 **아래로 갈수록 진해지는 것이 아니라 위로 갈수록 진해집니다.**

```
background (#f8f9fa)            ← 페이지 바탕
  └ surface-container-lowest (#ffffff)   ← 카드 (기본)
      └ surface-container-low (#f3f4f5)  ← 카드 내부 중첩 영역, 사이드바
          └ surface-container-high (#e7e8e9)  ← hover 상태
```

### 1.3 접근성 주의사항

- `outline` (`#737686`)은 흰 배경 대비 약 **4.3:1**로, WCAG AA 기준(4.5:1)에 **미달**합니다. 현재 아카이브 카드의 날짜 텍스트(`text-outline` + 12px caption)가 여기 해당합니다. 12px 본문 텍스트에는 `on-surface-variant`(#434654, 약 9:1)를 사용하고, `outline`은 테두리·아이콘 전용으로 제한하세요.
- 10% 틴트 배지(`bg-secondary/10 text-secondary`)는 대비가 유지됩니다(약 5:1). 다만 틴트를 5% 이하로 낮추지 마세요.
- 상태를 **색으로만** 전달하지 마세요. 배지에는 항상 텍스트 라벨을 동반합니다.

---

## 2. Typography

**Noto Sans** 단일 서체를 사용합니다. 다국어 지원 범위가 넓고(한글 포함) 중립적·체계적인 인상을 주어, 복잡한 학술 용어의 가독성을 화면 크기와 무관하게 유지합니다.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

한글 콘텐츠가 함께 쓰이는 경우 `Noto Sans KR`을 폴백 체인에 추가하세요.

```css
font-family: 'Noto Sans', 'Noto Sans KR', system-ui, sans-serif;
```

### 2.1 타입 스케일

| 토큰 | 크기 / 행간 | 굵기 | 자간 | 용도 |
|---|---|---|---|---|
| `display-lg` | 48 / 60 | 700 | -0.02em | 발표 슬라이드 제목 (16:9 전용) |
| `headline-lg` | 32 / 40 | 700 | -0.01em | 페이지 제목 ("Overview") |
| `headline-lg-mobile` | 24 / 32 | 700 | — | 모바일 페이지 제목 |
| `headline-md` | 24 / 32 | 600 | — | 섹션 제목, 브랜드 워드마크 |
| `title-lg` | 20 / 28 | 600 | — | 카드 제목 |
| `body-lg` | 18 / 28 | 400 | — | 슬라이드 부제, 리드 문단 |
| `body-md` | 16 / 24 | 400 | — | 기본 본문 |
| `label-md` | 14 / 20 | 500 | 0.01em | 버튼, 내비, 폼 라벨 |
| `caption` | 12 / 16 | 400 | — | 메타데이터, 날짜, 각주 |

위계는 **크기 변화보다 굵기와 색으로** 만듭니다. 제목은 600 또는 700으로 고정하고, 본문은 1.5배 행간으로 연구 초록 같은 장문 읽기를 지원합니다. 차트·표의 숫자는 세로 정렬이 흐트러지지 않도록 굵기를 통일하고 `font-variant-numeric: tabular-nums`를 적용하세요.

### 2.2 Tailwind 사용 시 주의

이 시스템은 `fontFamily`와 `fontSize`에 **같은 이름의 토큰**을 등록합니다. 따라서 두 클래스를 함께 써야 완전한 스타일이 적용됩니다.

```html
<h3 class="font-title-lg text-title-lg">카드 제목</h3>
```

`text-*`만 쓰면 크기·행간·굵기는 적용되지만 서체 지정이 누락됩니다.

---

## 3. Layout & Spacing

데스크톱은 데이터 시각화의 종횡비를 보존하기 위해 **고정 그리드**, 모바일은 **유동 그리드**로 전환합니다.

| 브레이크포인트 | 그리드 | 거터 | 여백 |
|---|---|---|---|
| Desktop (≥1280px) | 12 컬럼 | 24px | 좌우 최소 40px, 최대 폭 1280px 중앙 정렬 |
| Tablet (768–1279px) | 8 컬럼 | 16px | 좌우 24px |
| Mobile (<768px) | 4 컬럼 유동 | 16px | 좌우 16px |

간격은 **8pt 시스템**을 따릅니다. `base`(4px)는 아이콘과 라벨 사이 같은 미세 조정에만 쓰고, 그 외에는 `xs`(8) / `sm`(12) / `md`(16) / `lg`(24) / `xl`(32) / `2xl`(48)을 사용합니다.

- "발표용" 카드는 `2xl`(48px) 패딩으로 여유롭고 극적인 느낌을 줍니다.
- 행정용 데이터 테이블은 정보 밀도를 위해 `sm`(12px) 세로 셀 패딩을 씁니다.

### 3.1 앱 셸 구조

```
┌──────────┬────────────────────────────────────────┐
│          │  TopAppBar (h-16, sticky, z-30)        │
│ SideNav  ├────────────────────────────────────────┤
│ (w-64)   │                                        │
│ fixed    │  main (max-w-1280px, mx-auto)          │
│ z-40     │  p-margin-mobile md:p-margin-desktop   │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

- 사이드바: `w-64` 고정, 768px 미만에서 숨김 + 햄버거 메뉴로 전환
- 본문 래퍼: `md:ml-64`로 사이드바 폭만큼 오프셋
- z-index: 사이드바 `40` > 헤더 `30` > 슬라이드 진행바 `50`(발표 모드 전용)

---

## 4. Elevation & Depth

"모던 프로페셔널" 인상을 위해 무거운 그림자를 배제하고 **톤 레이어**와 **저대비 아웃라인**으로 깊이를 표현합니다.

1. **Surface Base** — 페이지 바탕 `#f8f9fa`
2. **Surface Container** — 흰 카드 `#ffffff`. 그림자 대신 **1px `surface-variant` 테두리**로 경계를 정의합니다.
3. **Elevated State** — 활성 인터랙션(카드 드래그, 드롭다운, hover)에만 사용. `0px 4px 20px rgba(0,0,0,0.05)`
4. **Interactive Focus** — 입력 필드·활성 카드는 2px Primary 테두리. 외곽 글로우(outer glow)는 쓰지 않습니다.

```css
/* Tailwind 임의 값으로 사용 */
.shadow-raised { box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05); }
```

---

## 5. Shapes

형태 언어는 **부드럽고 정밀하게(Soft and Precise)**. 현대적이되 유아적이지 않은 정도의 모서리 반경을 씁니다.

| 반경 | 토큰 | 적용 대상 |
|---|---|---|
| 2px | `rounded-sm` | 체크박스 |
| 4px | `rounded` | 입력 필드, 셀렉트, 작은 버튼, 페이지네이션 |
| 8px | `rounded-lg` | 카드, 배지, 필터 패널, 슬라이드 |
| 12px | `rounded-xl` | 내비게이션 아이템, 주요 CTA 버튼 |
| 9999px | `rounded-full` | 아바타, 알약 배지, 검색 입력창, 아이콘 버튼 |

---

## 6. Motion

- 색상 전환: `transition-colors duration-200`
- 위치·형태 전환: `transition-all duration-200 ease-in-out`
- 이미지 확대(카드 hover): `duration-500`
- 슬라이드 진행바: `duration-300 ease-out`
- 버튼 누름: `active:scale-95`

모션은 상태 변화를 알리는 용도로만 씁니다. 장식적 애니메이션은 넣지 않습니다. `prefers-reduced-motion: reduce`를 반드시 존중하세요.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Components

아래 클래스 문자열은 §0의 반경 스케일 수정을 반영한 버전입니다.

### 7.1 Buttons

```html
<!-- Primary -->
<button class="bg-primary text-on-primary font-label-md text-label-md rounded-xl
               py-sm px-md flex items-center justify-center gap-sm
               hover:bg-surface-tint transition-colors active:scale-95">
  <span class="material-symbols-outlined">add</span>
  New Achievement
</button>

<!-- Secondary (아웃라인) -->
<button class="border border-primary text-primary font-label-md text-label-md rounded-xl
               py-sm px-md hover:bg-primary/5 transition-colors">
  Export PDF
</button>

<!-- Ghost (툴바용) -->
<button class="text-on-surface-variant font-label-md text-label-md rounded
               py-sm px-md hover:bg-surface-container-high transition-colors">
  Exit Presentation
</button>

<!-- Icon button -->
<button class="w-10 h-10 flex items-center justify-center rounded-full
               text-on-surface-variant hover:bg-surface-container-high transition-colors">
  <span class="material-symbols-outlined">notifications</span>
</button>
```

Primary 버튼에 그라디언트를 쓰지 않습니다. 모든 컨트롤은 **일어날 일을 그대로 말합니다**("Submit"이 아니라 "Save changes"). 액션 이름은 전체 플로우에서 동일하게 유지합니다.

### 7.2 Achievement Card

플랫폼의 중심 컴포넌트입니다. 흰 배경 + 1px 테두리 + `rounded-lg`. 우측 상단에 성취 유형을 즉시 식별할 수 있는 **배지 영역**을 둡니다.

```html
<article class="bg-surface-container-lowest rounded-lg border border-surface-variant
                overflow-hidden flex flex-col h-full group cursor-pointer
                hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:border-outline
                transition-all">
  <div class="h-32 bg-surface-container-low relative overflow-hidden">
    <img class="w-full h-full object-cover group-hover:scale-105
                transition-transform duration-500" src="..." alt="...">
    <span class="absolute top-xs right-xs bg-secondary/10 text-secondary border border-secondary/20
                 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide
                 backdrop-blur-sm">STEM</span>
  </div>
  <div class="p-md flex flex-col flex-grow">
    <div class="flex items-start justify-between gap-sm mb-xs">
      <h3 class="font-title-lg text-title-lg text-on-surface leading-tight
                 line-clamp-2 min-w-0">Quantum Computing Scalability Analysis</h3>
      <span class="material-symbols-outlined text-on-surface-variant shrink-0">picture_as_pdf</span>
    </div>
    <p class="font-caption text-caption text-on-surface-variant mb-md">Dr. A. Chen et al.</p>
    <div class="mt-auto flex items-center justify-between">
      <time class="font-caption text-caption text-on-surface-variant">Oct 12, 2023</time>
      <button class="text-primary hover:underline font-label-md text-label-md">View details</button>
    </div>
  </div>
</article>
```

카드 전체가 클릭 가능하다면 내부에 별도 버튼을 중첩하지 말고, 제목을 링크로 만들고 카드에 `::after` 확장 히트 영역을 적용하세요. 중첩 인터랙티브 요소는 키보드 탐색을 망칩니다.

### 7.3 Achievement Badges

액센트 컬러의 **10% 불투명도 채움 + 100% 불투명도 텍스트**로 세련된 톤온톤 효과를 냅니다.

| 유형 | 클래스 |
|---|---|
| 성취 / 완료 | `bg-secondary/10 text-secondary border border-secondary/20` |
| 진행 중 / 주의 | `bg-tertiary/10 text-tertiary border border-tertiary/20` |
| 정보 / 분류 | `bg-primary/10 text-primary border border-primary/20` |
| 오류 | `bg-error/10 text-error border border-error/20` |

```html
<span class="inline-flex items-center gap-xs px-md py-xs rounded-full
             bg-secondary/10 text-secondary border border-secondary/20
             font-label-md text-label-md shrink-0">
  <span class="material-symbols-outlined text-[16px]" data-weight="fill">verified</span>
  Peer reviewed
</span>
```

### 7.4 Presentation-Ready Slides

16:9 종횡비의 특수 카드 변형입니다. 강의실이나 컨퍼런스에서 투사했을 때 판독 가능하도록 타이포 크기를 키우고(`display-lg`) `2xl` 패딩을 적용합니다.

```html
<div class="w-full max-h-[80vh] aspect-video bg-surface-container-lowest
            border border-surface-variant rounded-lg p-2xl
            flex flex-col justify-center items-start relative overflow-hidden">
  <h1 class="font-display-lg text-display-lg text-on-surface mb-lg max-w-4xl">…</h1>
  <p class="font-body-lg text-body-lg text-on-surface-variant max-w-4xl">…</p>
</div>
```

**발표 모드 셸:** 상단에 `h-1` 진행바(`bg-surface-variant` 트랙 + `bg-primary` 채움, `z-50`), 하단에 `h-20` 컨트롤 바(나가기 / 슬라이드 카운터 + 이전·다음 / 유틸리티 3종). 배경 장식 이미지는 `opacity-10`, `pointer-events-none`으로 텍스트를 방해하지 않게 합니다.

발표 모드에는 키보드 지원이 필수입니다: `←/→` 이동, `Esc` 종료, `F` 전체 화면.

### 7.5 Data Tables

짝수 행에 Neutral Surface 색으로 얼룩말 줄무늬를 넣습니다. 헤더는 스크롤 시 고정되며 `label-md` 600 굵기와 옅은 하단 테두리를 씁니다. **세로 테두리는 쓰지 않고**, 넉넉한 가로 간격으로 컬럼을 구분합니다.

```html
<table class="w-full text-left border-collapse">
  <thead class="sticky top-16 bg-surface-container-lowest z-10">
    <tr class="border-b border-outline-variant">
      <th class="font-label-md text-label-md font-semibold text-on-surface-variant py-sm px-md">
        Title
      </th>
    </tr>
  </thead>
  <tbody>
    <tr class="even:bg-surface odd:bg-surface-container-lowest hover:bg-surface-container-low
               transition-colors">
      <td class="font-body-md text-body-md py-sm px-md">…</td>
    </tr>
  </tbody>
</table>
```

### 7.6 Navigation

```html
<!-- 기본 항목 -->
<a class="flex items-center gap-sm py-sm px-md rounded-xl
          text-on-surface-variant font-label-md text-label-md
          hover:bg-surface-variant transition-all duration-200 ease-in-out">
  <span class="material-symbols-outlined">dashboard</span>Dashboard
</a>

<!-- 활성 항목: 아이콘 FILL 1 + primary 컬러 + 배경 -->
<a aria-current="page"
   class="flex items-center gap-sm py-sm px-md rounded-xl
          text-primary font-semibold bg-surface-variant
          font-label-md text-label-md">
  <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">folder_open</span>
  Archive
</a>
```

활성 상태는 색상만이 아니라 **아이콘 채움(FILL 1) + 배경 + 굵기** 세 가지로 동시에 표시하고, `aria-current="page"`를 반드시 붙입니다.

### 7.7 Form Controls

```html
<!-- 검색 -->
<div class="relative w-64">
  <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2
               text-on-surface-variant">search</span>
  <input type="search" placeholder="Search archive…"
         class="w-full pl-xl pr-sm py-xs rounded-full border border-outline-variant
                bg-surface-container-low font-body-md text-body-md
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
</div>

<!-- 셀렉트 -->
<select class="rounded border border-outline-variant bg-surface-container-lowest
               font-body-md text-body-md p-xs
               focus:border-primary focus:ring-1 focus:ring-primary">…</select>

<!-- 체크박스 -->
<label class="flex items-center gap-sm cursor-pointer group">
  <input type="checkbox"
         class="rounded-sm border-outline-variant text-primary focus:ring-primary w-4 h-4">
  <span class="font-body-md text-body-md text-on-surface
               group-hover:text-primary transition-colors">STEM</span>
</label>
```

포커스 링은 절대 제거하지 마세요. 커스텀 스타일을 쓰더라도 `:focus-visible`에서 2px Primary 윤곽이 보여야 합니다.

### 7.8 Dynamic Charts

**범주형 팔레트**를 Primary Blue → Secondary Green → Tertiary Orange 순으로 사용합니다. 선 그래프는 2px 스트로크, 막대 그래프는 4px 모서리 반경으로 시스템의 형태 언어에 맞춥니다.

```js
const chartPalette = ['#003fb1', '#006c49', '#694100', '#1a56db', '#4edea3', '#ffb95f'];
```

축 라벨은 `caption`, 격자선은 `surface-variant`. 데이터 계열이 6개를 넘으면 색을 늘리지 말고 그룹화하거나 인터랙티브 필터를 제공하세요.

---

## 8. Voice & Content

문구는 장식이 아니라 디자인 재료입니다.

- 사용자가 인식하고 제어하는 대상의 이름을 씁니다. 시스템 내부 구조 용어를 노출하지 않습니다.
- 능동태가 기본입니다. 버튼은 눌렀을 때 일어날 일을 그대로 말합니다.
- 하나의 액션은 플로우 전체에서 같은 이름을 유지합니다. "Publish" 버튼은 "Published" 토스트를 냅니다.
- 오류는 사과하지 않고, 무엇이 잘못됐고 어떻게 고치는지 말합니다.
- 빈 화면은 행동을 권하는 자리입니다. 분위기용 문구를 넣지 않습니다.
- 문장 형식(sentence case)을 기본으로 하되, 배지·섹션 소제목의 마이크로 라벨만 대문자(`uppercase tracking-wider`)를 씁니다.

---

## 9. 구현: 토큰 정의

### 9.1 CSS Custom Properties

```css
:root {
  /* Surface */
  --surface: #f8f9fa;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f3f4f5;
  --surface-container: #edeeef;
  --surface-container-high: #e7e8e9;
  --surface-container-highest: #e1e3e4;
  --surface-variant: #e1e3e4;
  --surface-tint: #1353d8;
  --on-surface: #191c1d;
  --on-surface-variant: #434654;
  --inverse-surface: #2e3132;
  --inverse-on-surface: #f0f1f2;
  --outline: #737686;
  --outline-variant: #c3c5d7;

  /* Primary */
  --primary: #003fb1;
  --on-primary: #ffffff;
  --primary-container: #1a56db;
  --on-primary-container: #d4dcff;

  /* Secondary */
  --secondary: #006c49;
  --on-secondary: #ffffff;
  --secondary-container: #6cf8bb;
  --on-secondary-container: #00714d;

  /* Tertiary */
  --tertiary: #694100;
  --on-tertiary: #ffffff;
  --tertiary-container: #895600;
  --on-tertiary-container: #ffd6a8;

  /* Error */
  --error: #ba1a1a;
  --on-error: #ffffff;
  --error-container: #ffdad6;
  --on-error-container: #93000a;

  /* Spacing */
  --space-base: 4px;  --space-xs: 8px;   --space-sm: 12px;
  --space-md: 16px;   --space-lg: 24px;  --space-xl: 32px;
  --space-2xl: 48px;  --gutter: 24px;
  --margin-mobile: 16px; --margin-desktop: 40px; --max-width: 1280px;

  /* Radius */
  --radius-sm: 2px; --radius: 4px; --radius-lg: 8px;
  --radius-xl: 12px; --radius-full: 9999px;

  /* Elevation */
  --shadow-raised: 0px 4px 20px rgba(0, 0, 0, 0.05);
}
```

### 9.2 Tailwind v3 설정

```js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface': '#f8f9fa',
        'surface-dim': '#d9dadb',
        'surface-bright': '#f8f9fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'surface-variant': '#e1e3e4',
        'surface-tint': '#1353d8',
        'on-surface': '#191c1d',
        'on-surface-variant': '#434654',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        'background': '#f8f9fa',
        'on-background': '#191c1d',
        'outline': '#737686',
        'outline-variant': '#c3c5d7',
        'primary': '#003fb1',
        'on-primary': '#ffffff',
        'primary-container': '#1a56db',
        'on-primary-container': '#d4dcff',
        'inverse-primary': '#b5c4ff',
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b5c4ff',
        'on-primary-fixed': '#00174d',
        'on-primary-fixed-variant': '#003dab',
        'secondary': '#006c49',
        'on-secondary': '#ffffff',
        'secondary-container': '#6cf8bb',
        'on-secondary-container': '#00714d',
        'secondary-fixed': '#6ffbbe',
        'secondary-fixed-dim': '#4edea3',
        'on-secondary-fixed': '#002113',
        'on-secondary-fixed-variant': '#005236',
        'tertiary': '#694100',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#895600',
        'on-tertiary-container': '#ffd6a8',
        'tertiary-fixed': '#ffddb8',
        'tertiary-fixed-dim': '#ffb95f',
        'on-tertiary-fixed': '#2a1700',
        'on-tertiary-fixed-variant': '#653e00',
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'lg': '8px',
        'xl': '12px',
        'full': '9999px',
      },
      spacing: {
        'base': '4px', 'xs': '8px', 'sm': '12px', 'md': '16px',
        'lg': '24px', 'xl': '32px', '2xl': '48px',
        'gutter': '24px', 'margin-mobile': '16px',
        'margin-desktop': '40px', 'max-width': '1280px',
      },
      fontFamily: {
        sans: ['Noto Sans', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg':        ['48px', { lineHeight: '60px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg':       ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile':['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-md':       ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-lg':          ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg':           ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':           ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md':          ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'caption':           ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      boxShadow: {
        raised: '0px 4px 20px rgba(0, 0, 0, 0.05)',
      },
      maxWidth: {
        'max-width': '1280px',
      },
    },
  },
};
```

> 서체를 `sans` 하나로 통합했으므로, 마크업에서 `font-title-lg` 같은 중복 클래스는 더 이상 필요 없습니다. `text-title-lg`만 쓰면 됩니다. 기존 코드를 옮길 때는 `font-{name}` 클래스를 제거하세요.

### 9.3 Tailwind v4 (CSS-first)

```css
@import "tailwindcss";

@theme {
  --color-primary: #003fb1;
  --color-on-primary: #ffffff;
  --color-primary-container: #1a56db;
  --color-secondary: #006c49;
  --color-tertiary: #694100;
  --color-error: #ba1a1a;
  --color-surface: #f8f9fa;
  --color-surface-container-lowest: #ffffff;
  --color-surface-variant: #e1e3e4;
  --color-on-surface: #191c1d;
  --color-on-surface-variant: #434654;
  --color-outline: #737686;
  --color-outline-variant: #c3c5d7;

  --font-sans: 'Noto Sans', 'Noto Sans KR', system-ui, sans-serif;

  --text-display-lg: 48px;
  --text-display-lg--line-height: 60px;
  --text-display-lg--letter-spacing: -0.02em;
  --text-display-lg--font-weight: 700;
  /* … 나머지 스케일 동일 패턴 */

  --radius-sm: 2px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

### 9.4 아이콘

Material Symbols Outlined를 사용합니다.

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.material-symbols-outlined[data-weight="fill"] {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

기본은 아웃라인, **활성·선택 상태에서만 FILL 1**로 전환합니다. 장식용 아이콘에는 `aria-hidden="true"`를, 아이콘만 있는 버튼에는 `aria-label`을 붙입니다.

---

## 10. 품질 체크리스트

프로덕션 배포 전 확인:

- [ ] `rounded-full`이 실제로 원형/알약으로 렌더링되는가 (§0.1)
- [ ] 주요 액션이 모두 `primary` 하나로 통일됐는가 (§0.2)
- [ ] 12px 텍스트에 `outline` 대신 `on-surface-variant`를 썼는가 (§1.3)
- [ ] 375px 폭에서 가로 스크롤이 발생하지 않는가
- [ ] 키보드만으로 모든 인터랙션에 도달 가능하고 포커스가 눈에 보이는가
- [ ] 활성 내비게이션에 `aria-current="page"`가 있는가
- [ ] 상태가 색상 외의 수단으로도 전달되는가
- [ ] `prefers-reduced-motion`이 존중되는가
- [ ] 모든 의미 있는 이미지에 실제 `alt` 텍스트가 있는가 (현재 코드는 `data-alt`만 있고 `alt`가 비어 있는 경우가 다수)
