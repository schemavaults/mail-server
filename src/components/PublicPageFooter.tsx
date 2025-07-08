"use client";

import { cn, Wordmark } from "@schemavaults/ui";
import { Github, Linkedin, Twitter } from "lucide-react";
import type { FC, ReactElement } from "react";

function ResourcesSectionLink({
  href,
  title,
}: {
  title: string;
  href: string;
}): ReactElement {
  return (
    <li>
      <a href={href} className="hover:underline">
        {title}
      </a>
    </li>
  );
}

function FollowUsSectionLink({
  href,
  title,
}: {
  title: string;
  href: string;
}): ReactElement {
  return (
    <li>
      <a href={href} className="hover:underline">
        {title}
      </a>
    </li>
  );
}

function SocialMediaIconLink({
  Icon,
  alt,
  href,
}: {
  Icon: FC<{ className?: string }>;
  alt: string;
  href: string;
}) {
  return (
    <a href={href} className="text-gray-500 text-card-foreground">
      <Icon className="h-6 w-6" />
      <span className="sr-only">{alt}</span>
    </a>
  );
}

export interface PublicPageFooterProps {
  containerClassName?: string;
}

export function PublicPageFooter({
  containerClassName,
}: PublicPageFooterProps): ReactElement {
  const linkItemFontClassName: string =
    "text-gray-500 dark:text-gray-400 font-medium";

  const githubHref: string = "https://github.com/schemavaults";
  const twitterHref: string = "https://x.com/schemavaults";
  const linkedInHref: string = "https://linkedin.com/company/schemavaults";

  return (
    <footer className={cn("bg-card", containerClassName)}>
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="https://schemavaults.com/" className="flex items-center">
              <img
                src="https://schemavaults.com/media/android-chrome-512x512.png"
                className="h-8 me-3"
                alt="SchemaVaults Logo"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                <Wordmark />
              </span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-card-foreground uppercase">
                Resources
              </h2>
              <ul
                className={cn(
                  linkItemFontClassName,
                  "font-medium flex flex-col gap-2",
                )}
              >
                <ResourcesSectionLink
                  title="SchemaVaults Web"
                  href="https://schemavaults.com"
                />
                <ResourcesSectionLink
                  title="SchemaVaults Auth Platform"
                  href="https://auth.schemavaults.com"
                />
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-card-foreground uppercase">
                Follow us
              </h2>
              <ul className={cn(linkItemFontClassName)}>
                <FollowUsSectionLink title="GitHub" href={githubHref} />
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-card-foreground">
                Legal
              </h2>
              <ul className={cn(linkItemFontClassName)}>
                <li className="mb-4">
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-card-foreground sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm sm:text-center text-accent-foreground">
            © 2025{" "}
            <a href="https://schemavaults.com" className="hover:underline">
              <Wordmark />™
            </a>
            . All Rights Reserved.
          </span>
          <div className="flex gap-2 md:gap-4 mt-4 sm:justify-center sm:mt-0">
            <SocialMediaIconLink Icon={Github} alt="GitHub" href={githubHref} />
            <SocialMediaIconLink
              Icon={Twitter}
              alt="X/Twitter"
              href={twitterHref}
            />
            <SocialMediaIconLink
              Icon={Linkedin}
              alt="LinkedIn"
              href={linkedInHref}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicPageFooter;
