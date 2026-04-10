"use client";

import { cn, Button } from "@schemavaults/ui";
import type { ReactElement } from "react";
import Link from "next/link";
import { BookTemplate, Home, KeyRound, Send, ShieldAlert } from "lucide-react";

export interface AdminLinksSectionProps {
  renderLocation: "homepage" | "admin_dashboard";
}

export default function AdminLinksSection({
  renderLocation,
}: AdminLinksSectionProps): ReactElement {
  const linkButtonClassname: string = cn(
    "flex flex-row flex-nowrap gap-2 items-center justify-start",
  );

  return (
    <section
      className={cn(
        "flex flex-row items-center justify-center w-full gap-4",
        "my-4",
        "px-4 md:px-8 lg:px-16 xl:px-24",
      )}
    >
      {renderLocation !== "homepage" && (
        <Link href="/">
          <Button className={linkButtonClassname}>
            <Home className="h-4 w-4" />
            View public homepage
          </Button>
        </Link>
      )}
      <Link href="/admin/all_mailing_lists">
        <Button className={linkButtonClassname}>
          <ShieldAlert className="h-4 w-4" />
          View all mailing lists (including non-public)
        </Button>
      </Link>
      <Link href="/admin/templates">
        <Button className={linkButtonClassname}>
          <BookTemplate className="h-4 w-4" />
          View mail templates
        </Button>
      </Link>
      <Link href="/admin/send-email">
        <Button className={linkButtonClassname}>
          <Send className="h-4 w-4" />
          Send an email
        </Button>
      </Link>
      <Link href="/admin/keys">
        <Button className={linkButtonClassname}>
          <KeyRound className="h-4 w-4" />
          Manage API keys
        </Button>
      </Link>
    </section>
  );
}
