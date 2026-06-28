import Image from "next/image";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function Logo({ className, size = 40, priority }: LogoProps) {
  return (
    <Image
      src={withBasePath("/logo.png")}
      alt="The Gaming Adda"
      width={size}
      height={size}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
