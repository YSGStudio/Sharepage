/**
 * BRAIDGE 워드마크: BRIDGE 사이에 AI 를 끼운 지도안 도구 이름.
 * AI 두 글자만 그라데이션과 작은 반짝임으로 강조한다. 크기·굵기는 부모 글꼴을 따른다.
 */
export function BraidgeWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap ${className}`} aria-label="BRAIDGE">
      <span aria-hidden>BR</span>
      <span aria-hidden className="relative inline-block">
        <span className="bg-gradient-to-br from-brand-500 via-brand-400 to-secondary bg-clip-text text-transparent">
          AI
        </span>
        <svg
          viewBox="0 0 12 12"
          className="absolute -right-[0.3em] -top-[0.2em] h-[0.4em] w-[0.4em] text-accent-300"
          fill="currentColor"
        >
          <path d="M6 0c.4 3.2 2.8 5.6 6 6-3.2.4-5.6 2.8-6 6-.4-3.2-2.8-5.6-6-6 3.2-.4 5.6-2.8 6-6Z" />
        </svg>
      </span>
      <span aria-hidden>DGE</span>
    </span>
  );
}
