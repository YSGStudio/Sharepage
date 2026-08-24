import type { ReactNode } from "react";

/** 페이지 상단 제목 영역 */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <div className="border-b border-surface-variant bg-surface-container-lowest">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.01em] text-on-surface sm:text-3xl lg:text-[32px] lg:leading-10">
          {title}
        </h1>
        {description && (
          <div className="mt-4 max-w-3xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

/** 본문 컨테이너 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

/** 제목이 붙은 본문 섹션 */
export function Section({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-12 last:mb-0 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-on-surface sm:text-2xl">{title}</h2>
      )}
      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          {description}
        </p>
      )}
      <div className={title || description ? "mt-6" : ""}>{children}</div>
    </section>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-surface-variant bg-surface-container-lowest p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "accent" | "muted";
}) {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    accent: "bg-accent-100 text-accent-700",
    muted: "bg-slate-100 text-ink-500",
  } as const;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** 표가 좁은 화면을 밀어내지 않도록 가로 스크롤을 표 자체에 가둔다 (R18) */
export function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-brand-100">
      {children}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    info: "border-brand-200 bg-brand-50 text-ink-700",
    warning: "border-accent-300 bg-accent-100 text-accent-700",
  } as const;

  return (
    <div className={`rounded-xl border p-4 text-sm leading-relaxed ${tones[tone]}`}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </div>
  );
}
