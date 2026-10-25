"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-ink-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink-900 " +
  "placeholder:text-ink-500/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 " +
  "disabled:bg-slate-50 disabled:text-ink-500";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={`${controlClass} ${props.className ?? ""}`} />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

/** 제출 중에는 자동으로 비활성화된다. */
export function SubmitButton({
  children,
  pendingLabel = "처리 중…",
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "border border-brand-200 text-brand-700 hover:bg-brand-50",
    danger: "border border-red-200 text-red-700 hover:bg-red-50",
  } as const;

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2 text-sm ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {children}
    </p>
  );
}
