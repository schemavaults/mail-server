"use client";

import type { MailingListSubscriber } from "@/lib/mail-db";
import { cn, Separator } from "@schemavaults/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

export interface SubscribersClientViewProps {
  mailing_list_name: string;
  mailing_list_id: string;
  subscribers: readonly MailingListSubscriber[];
}

export default function SubscribersClientView({
  mailing_list_name,
  mailing_list_id,
  subscribers,
}: SubscribersClientViewProps): ReactElement {
  return (
    <div
      className={cn(
        "w-full min-h-screen h-full",
        "flex flex-col justify-start items-stretch",
        "bg-background",
      )}
    >
      <header
        className={cn(
          "h-24",
          "flex items-center justify-start gap-2 md:gap-4",
          "p-2 md:p-4",
          "shadow-md",
        )}
      >
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Mailing Lists</span>
        </Link>
        <h2 className="text-xl md:text-2xl text-foreground">
          Subscribers: {mailing_list_name}
        </h2>
      </header>
      <Separator decorative orientation="horizontal" className="w-full" />
      <main className="flex flex-col justify-start items-stretch w-full grow flex-nowrap">
        <section
          className={cn(
            "flex flex-col w-full grow justify-start items-stretch gap-4",
            "py-4 px-4 md:px-8 lg:px-16 xl:px-24",
          )}
        >
          {subscribers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No subscribers found for this mailing list.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {subscribers.length} subscriber
                {subscribers.length !== 1 ? "s" : ""}
              </p>
              <ul className="flex flex-col gap-2">
                {subscribers.map((subscriber) => (
                  <li
                    key={`${subscriber.mailing_list_id}-${subscriber.email}`}
                    className={cn(
                      "w-full p-2 md:p-4",
                      "flex flex-col md:flex-row md:items-center gap-2 md:justify-between",
                      "border rounded-md",
                      "bg-card shadow-md",
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {subscriber.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Subscribed{" "}
                      {new Date(subscriber.subscribe_time).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
