import { memo, type ReactNode } from "react";
import { getPlatformStyle } from "@/lib/platform-styles";
import type { ConsolePlatform } from "@/types";

interface PlatformIconProps {
  platform: ConsolePlatform;
  className?: string;
  size?: number;
  color?: string;
}

function PlatformIconComponent({
  platform,
  className = "",
  size = 48,
  color: colorOverride,
}: PlatformIconProps) {
  const { color: platformColor } = getPlatformStyle(platform);
  const color = colorOverride ?? platformColor;

  const icons: Record<ConsolePlatform, ReactNode> = {
    playstation: (
      <>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M8.5 9.5v5M8.5 12h2.5M15.5 9.5c-1.2 0-2 .8-2 2s.8 2 2 2c1.2 0 2-.8 2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </>
    ),
    xbox: (
      <path d="M12 4l2.5 4.5L19 9l-3.5 3.5L16.5 18 12 15.5 7.5 18l1-5.5L5 9l4.5-.5L12 4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={`${color}22`} />
    ),
    nintendo: (
      <>
        <rect x="4" y="8" width="7" height="10" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <rect x="13" y="8" width="7" height="10" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}18`} />
        <circle cx="7.5" cy="12" r="1.2" fill={color} />
        <circle cx="16.5" cy="12" r="1.2" fill={color} />
      </>
    ),
    pc: (
      <>
        <rect x="3" y="5" width="18" height="12" rx="1.5" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
        <path d="M8 20h8M12 17v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 9h10M7 12h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      </>
    ),
    vr: (
      <>
        <path d="M3 12c0-3 2-5 5-5h8c3 0 5 2 5 5v2c0 2-1.5 3.5-3.5 3.5h-1.5l-1.5 2-1.5-2H9C6.5 17.5 3 16 3 14v-2z" stroke={color} strokeWidth="1.5" fill={`${color}15`} strokeLinejoin="round" />
        <circle cx="9" cy="12" r="1.5" fill={color} />
        <circle cx="15" cy="12" r="1.5" fill={color} />
      </>
    ),
    other: (
      <path d="M6 8h12v8H6zM9 8V6h6v2M10 14h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={`${color}15`} />
    ),
  };

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      {icons[platform]}
    </svg>
  );
}

export const PlatformIcon = memo(PlatformIconComponent);
