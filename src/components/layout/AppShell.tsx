"use client";

import { BottomTabBar } from "@/components/layout/BottomTabBar";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex flex-1 flex-col pb-[var(--app-bottom-inset)] md:pb-0">
        {children}
      </div>
      <BottomTabBar />
    </>
  );
}
