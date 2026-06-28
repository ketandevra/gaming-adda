import { cn } from "@/lib/utils";
import { memo, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "btn-gradient active:scale-[0.98]",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--cyan)] hover:text-[var(--accent-muted)]",
  ghost:
    "text-[var(--foreground-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]",
  danger: "bg-[var(--danger)] text-white hover:bg-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-8 px-3 py-1 text-xs font-semibold",
  md: "min-h-10 px-4 py-2 text-sm font-semibold",
  lg: "min-h-11 px-5 py-2.5 text-sm font-bold",
};

export const Button = memo(function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)] disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});
