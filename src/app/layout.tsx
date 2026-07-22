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
import { getBrandConfig, type BrandConfig } from "@/lib/branding";

const inter = Inter({ subsets: ["latin"] });

const branding: BrandConfig = getBrandConfig();

export const metadata: Metadata = {
  title: `${branding.name} Mail`,
  description: `App for managing the sending of ${branding.name}'s mail`,
  icons: {
    // Served from the branding assets API so an admin-uploaded favicon takes
    // effect without a redeploy; falls back to the bundled default icon.
    icon: "/api/branding/favicon",
  },
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
        <ClientAppLogicProviders
          environment={environment}
          app_id={app_id}
          branding={branding}
        >
          <ClientAppVisualsProvider>{children}</ClientAppVisualsProvider>
        </ClientAppLogicProviders>
      </body>
    </html>
  );
}
