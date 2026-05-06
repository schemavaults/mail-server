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
  Wordmark,
} from "@schemavaults/ui";
import {
  useAppEnvironment,
  useCurrentUser,
} from "@schemavaults/auth-react-provider";
import getSchemaVaultsCoreWebAppUrl from "@/lib/getSchemaVaultsCoreWebAppUrl";
import { ArrowLeft, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";

export type NavProps = PropsWithChildren<{
  title: ReactNode;
  backHref?: string;
}>;

export function Nav({ title, backHref, children }: NavProps): ReactElement {
  const environment = useAppEnvironment();
  const user = useCurrentUser();
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

        <a href={getSchemaVaultsCoreWebAppUrl(environment)}>
          <h1 className={cn(headerFontSizeClassName)}>
            <Wordmark />
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

        {(children || user) && (
          <div className="ml-auto flex items-center gap-2 md:gap-4">
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
        )}
      </header>
      <Separator decorative orientation="horizontal" className="w-full" />
    </>
  );
}

export default Nav;
