import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm text-[var(--muted)]">
        {label}
      </label>
      <textarea
        id={inputId}
        className={cn(
          "min-h-[96px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
