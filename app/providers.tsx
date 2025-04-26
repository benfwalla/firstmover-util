"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { MapStateProvider } from "@/context/map-state-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <MapStateProvider>
        {children}
      </MapStateProvider>
    </ThemeProvider>
  );
}
