"use client";

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
} from "@schemavaults/ui";
import { BrandWordmark } from "@/components/BrandWordmark";
import { useAdmin, useCurrentUser } from "@schemavaults/auth-react-provider";
import { useCoreWebAppUrl } from "@/contexts/CoreWebAppUrlContext";
import { ADMIN_LINKS } from "@/lib/admin-links";
import { ArrowLeft, BookOpen, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";

export type NavProps = PropsWithChildren<{
  title: ReactNode;
  backHref?: string;
}>;

export function Nav({ title, backHref, children }: NavProps): ReactElement {
  const coreWebAppUrl = useCoreWebAppUrl();
  const user = useCurrentUser();
  const admin = useAdmin();
  const headerFontSizeClassName: string = "text-xl md:text-2xl";

  return (
    <>
      <header
        className={cn(
          "h-24",
          "flex items-center justify-start gap-2 md:gap-4",
          "p-2 md:p-4",
          "shadow-md",
        )}
      >
        {backHref && (
          <Link
            href={backHref}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Link>
        )}

        <a href={coreWebAppUrl}>
          <h1 className={cn(headerFontSizeClassName)}>
            <BrandWordmark />
          </h1>
        </a>

        <Separator decorative orientation="vertical" className="h-14" />
        <h2
          className={cn(
            headerFontSizeClassName,
            "flex items-center gap-2 text-foreground",
          )}
        >
          {title}
        </h2>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <Button variant="ghost" asChild>
            <Link
              href="/docs"
              title="API Documentation"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">API Docs</span>
              <span className="sr-only sm:hidden">API Documentation</span>
            </Link>
          </Button>
          {children}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 max-w-[60vw]"
                >
                  <span className="truncate">{user.email}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Signed in as
                    </span>
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {admin && (
                  <>
                    {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
                      <DropdownMenuItem key={href} asChild>
                        <Link
                          href={href}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href="/auth/logout"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <Separator decorative orientation="horizontal" className="w-full" />
    </>
  );
}

export default Nav;
