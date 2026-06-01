import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-xs text-[var(--muted)]">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}
