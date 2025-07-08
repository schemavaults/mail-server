"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@schemavaults/ui";
import Link from "next/link";

export function FixedBackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="
        absolute
        top-2 md:top-4 lg:top-6 xl:top-8
        left-2 md:left-4 lg:left-6 xl:left-8
        z-50
      "
    >
      <Button variant={"outline"}>
        <ArrowLeft className="w-6 h-6" />
      </Button>
    </Link>
  );
}
