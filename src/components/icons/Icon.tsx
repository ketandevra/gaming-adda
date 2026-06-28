import { cn } from "@/lib/utils";
import type { SVGAttributes } from "react";

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function Icon({
  size = 20,
  className,
  children,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}
