"use client";

import {
  Toaster,
  TooltipProvider,
  BrightnessThemeProvider,
  LazyFramerMotionProvider,
} from "@schemavaults/ui";
import type { PropsWithChildren, ReactElement } from "react";

export interface IClientAppVisualsProviderProps extends PropsWithChildren {}

export function ClientAppVisualsProvider({
  children,
}: IClientAppVisualsProviderProps): ReactElement {
  return (
    <BrightnessThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <LazyFramerMotionProvider key="lazy-framer-motion-provider">
        <TooltipProvider>{children}</TooltipProvider>
      </LazyFramerMotionProvider>
      <Toaster />
    </BrightnessThemeProvider>
  );
}
