"use client";

import { cn, Separator } from "@schemavaults/ui";
import type { ReactElement } from "react";
import Image from "next/image";
import { useAdmin } from "@schemavaults/auth-react-provider";
import { useBranding } from "@/contexts/BrandingContext";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Nav } from "@/components/Nav";
import PublicPageFooter from "@/components/PublicPageFooter";
import AdminLinksSection from "@/components/AdminLinksSection";

/**
 * Homepage variant rendered when the public mailing list directory is
 * disabled via HOMEPAGE_SHOW_MAILING_LISTS=false: a minimal branded landing
 * page for deployments that use this app solely as an email template/sender
 * rather than a mailing list management tool. Admins still get their quick
 * links to the admin tooling.
 */
export function MailServerLandingPage(): ReactElement {
  const admin: boolean = useAdmin();
  const branding = useBranding();

  return (
    <div
      className={cn(
        "w-full min-h-screen h-full",
        "flex flex-col justify-center items-stretch",
        "bg-background",
      )}
    >
      <Nav title="Mail" />
      <main className="flex flex-col justify-start items-stretch w-full grow flex-nowrap">
        <section
          className={cn(
            "flex flex-col w-full grow justify-center items-center",
            "gap-2 md:gap-4",
            "py-4 px-4 md:px-8 lg:px-16 xl:px-24",
          )}
        >
          <Image
            src="/api/branding/logo"
            alt={`${branding.name} Logo`}
            width={64}
            height={64}
            unoptimized
          />
          <h2 className="text-2xl md:text-3xl font-semibold">
            <BrandWordmark /> Mail
          </h2>
          <p className="text-muted-foreground text-center select-none">
            This server sends email on behalf of {branding.name}.
          </p>
        </section>
        {admin && <AdminLinksSection renderLocation="homepage" />}
      </main>
      <Separator decorative orientation="horizontal" className="w-full" />
      <PublicPageFooter containerClassName="w-full" />
    </div>
  );
}

export default MailServerLandingPage;
