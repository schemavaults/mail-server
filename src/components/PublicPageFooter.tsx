"use client";

import { useBranding } from "@/contexts/BrandingContext";
import { BrandWordmark } from "@/components/BrandWordmark";
import { cn } from "@schemavaults/ui";
import { Github, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FC, ReactElement } from "react";

function FooterSectionLink({
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
  const branding = useBranding();

  const linkItemFontClassName: string =
    "text-gray-500 dark:text-gray-400 font-medium";

  const socialLinks: readonly {
    Icon: FC<{ className?: string }>;
    alt: string;
    href: string | null;
  }[] = [
    { Icon: Github, alt: "GitHub", href: branding.githubUrl },
    { Icon: Twitter, alt: "X/Twitter", href: branding.twitterUrl },
    { Icon: Linkedin, alt: "LinkedIn", href: branding.linkedinUrl },
  ];
  const visibleSocialLinks = socialLinks.filter(
    (link): link is { Icon: FC<{ className?: string }>; alt: string; href: string } =>
      typeof link.href === "string" && link.href.length > 0,
  );

  const legalLinks: readonly { title: string; href: string | null }[] = [
    { title: "Privacy Policy", href: branding.privacyPolicyUrl },
    { title: "Terms & Conditions", href: branding.termsUrl },
  ];
  const visibleLegalLinks = legalLinks.filter(
    (link): link is { title: string; href: string } =>
      typeof link.href === "string" && link.href.length > 0,
  );

  return (
    <footer className={cn("bg-card", containerClassName)}>
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link
              href={branding.url}
              className="flex items-center flex-row flex-nowrap gap-2 md:gap-4"
            >
              <Image
                src="/api/branding/logo"
                alt={`${branding.name} Logo`}
                width={48}
                height={48}
                unoptimized
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                <BrandWordmark />
              </span>
            </Link>
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
                <FooterSectionLink title={branding.name} href={branding.url} />
                <FooterSectionLink title="API Documentation" href="/docs" />
                <FooterSectionLink title="Login" href="/auth/login" />
              </ul>
            </div>
            {visibleSocialLinks.length > 0 && (
              <div>
                <h2 className="mb-6 text-sm font-semibold text-card-foreground uppercase">
                  Follow us
                </h2>
                <ul
                  className={cn(
                    linkItemFontClassName,
                    "font-medium flex flex-col gap-2",
                  )}
                >
                  {visibleSocialLinks.map(({ alt, href }) => (
                    <FooterSectionLink key={alt} title={alt} href={href} />
                  ))}
                </ul>
              </div>
            )}
            {visibleLegalLinks.length > 0 && (
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-card-foreground">
                  Legal
                </h2>
                <ul
                  className={cn(
                    linkItemFontClassName,
                    "font-medium flex flex-col gap-2",
                  )}
                >
                  {visibleLegalLinks.map(({ title, href }) => (
                    <FooterSectionLink key={title} title={title} href={href} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <hr className="my-6 border-card-foreground sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm sm:text-center text-accent-foreground">
            © {new Date().getFullYear()}{" "}
            <a href={branding.url} className="hover:underline">
              <BrandWordmark />
            </a>
            . All Rights Reserved.
          </span>
          {visibleSocialLinks.length > 0 && (
            <div className="flex gap-2 md:gap-4 mt-4 sm:justify-center sm:mt-0">
              {visibleSocialLinks.map(({ Icon, alt, href }) => (
                <SocialMediaIconLink
                  key={alt}
                  Icon={Icon}
                  alt={alt}
                  href={href}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default PublicPageFooter;
