import { cn } from "@/lib/utils";
import { memo, type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "danger";
}

const variants = {
  default: "status-badge-neutral",
  accent: "status-badge-neutral",
  success: "status-badge-success",
  warning: "status-badge-warning",
  danger: "status-badge-danger",
};

export const Badge = memo(function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
});
