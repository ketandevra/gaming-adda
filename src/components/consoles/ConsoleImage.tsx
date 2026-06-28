"use client";

import Image from "next/image";
import { getConsoleImagePath } from "@/lib/console-images";
import { cn } from "@/lib/utils";
import type { GameConsole } from "@/types";
import { memo, useMemo } from "react";

interface ConsoleImageProps {
  console: Pick<GameConsole, "id" | "name" | "platform" | "description" | "imageUrl">;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  showOverlay?: boolean;
}

function ConsoleImageComponent({
  console: gameConsole,
  className,
  imageClassName,
  priority,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  showOverlay = true,
}: ConsoleImageProps) {
  const src = useMemo(() => getConsoleImagePath(gameConsole), [gameConsole]);

  return (
    <div className={cn("relative overflow-hidden bg-[var(--surface-elevated)]", className)}>
      <Image
        src={src}
        alt={gameConsole.name}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
      />
      {showOverlay ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      ) : null}
    </div>
  );
}

export const ConsoleImage = memo(ConsoleImageComponent);
