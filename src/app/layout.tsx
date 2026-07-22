import "@schemavaults/theme/globals.css";
import { type ReactNode } from "react";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClientAppLogicProviders } from "./client-app-logic-providers";
import { ClientAppVisualsProvider } from "./client-app-visuals-provider";
import {
  getAppEnvironment,
  type ApiServerId,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import { getAppId } from "@/lib/getAppId";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SchemaVaults Mail",
  description: "App for managing the sending of SchemaVaults' mail",
};

const environment: SchemaVaultsAppEnvironment = getAppEnvironment();
const app_id: ApiServerId = getAppId();

/** GLOBAL LAYOUT */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="w-screen flex flex-col min-h-dvh h-full overscroll-none"
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} w-screen flex flex-col grow min-h-full h-full`}
      >
        <ClientAppLogicProviders environment={environment} app_id={app_id}>
          <ClientAppVisualsProvider>{children}</ClientAppVisualsProvider>
        </ClientAppLogicProviders>
      </body>
    </html>
  );
}
