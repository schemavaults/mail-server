import "@schemavaults/theme/globals.css";
import { type ReactNode } from "react";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClientAppLogicProviders } from "./client-app-logic-providers";
import { ClientAppVisualsProvider } from "./client-app-visuals-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SchemaVaults Mail",
  description: "App for managing the sending of SchemaVaults' mail",
};

/** GLOBAL LAYOUT */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="w-full flex flex-col min-h-full h-full"
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} w-full flex flex-col grow min-h-full h-full`}
      >
        <ClientAppLogicProviders>
          <ClientAppVisualsProvider>{children}</ClientAppVisualsProvider>
        </ClientAppLogicProviders>
      </body>
    </html>
  );
}
