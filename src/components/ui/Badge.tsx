import { cn } from "@/lib/utils";
import { memo, type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "success" | "warning";
}

const variants = {
  default: "bg-white/10 text-[var(--foreground)]",
  accent: "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30",
  success: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
};

export const Badge = memo(function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
});
