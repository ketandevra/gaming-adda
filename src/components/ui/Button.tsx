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
  primary:
    "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] shadow-[0_0_16px_rgba(0,255,198,0.2)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]",
  ghost: "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5",
  danger: "bg-red-600/90 text-white hover:bg-red-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-8 px-2.5 py-1 text-xs font-semibold",
  md: "min-h-9 px-3.5 py-2 text-sm font-medium",
  lg: "min-h-10 px-4 py-2 text-sm font-semibold",
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
        "inline-flex items-center justify-center gap-1.5 rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
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
