"use client";

import { cn, Button } from "@schemavaults/ui";
import type { ReactElement } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import ADMIN_LINKS from "@/lib/admin-links";

export interface AdminLinksSectionProps {
  renderLocation: "homepage" | "admin_dashboard";
}

export default function AdminLinksSection({
  renderLocation,
}: AdminLinksSectionProps): ReactElement {
  const linkButtonClassname: string = cn(
    "flex flex-row flex-nowrap gap-2 items-center justify-start",
  );

  const links =
    renderLocation === "homepage"
      ? ADMIN_LINKS.filter((link) => link.href !== "/")
      : ADMIN_LINKS;

  return (
    <section
      className={cn(
        "w-full max-w-[90vw]",
        "flex flex-col md:flex-row",
        "flex-nowrap md:flex-wrap",
        "gap-4",
        "items-center justify-center",
        "my-4",
        "px-4 md:px-8 lg:px-16 xl:px-24",
      )}
    >
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}>
          <Button className={linkButtonClassname}>
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        </Link>
      ))}
      <Link href="/auth/logout">
        <Button className={linkButtonClassname}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </Link>
    </section>
  );
}
