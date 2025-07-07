"use client";

import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { cn } from "@schemavaults/ui";
import type { ReactElement } from "react";

export interface AvailableMailingListsViewProps {
  mailing_lists: readonly MailingListDefinition[];
}

function AvailableMailingLists({
  mailing_lists,
}: AvailableMailingListsViewProps): ReactElement {
  if (!Array.isArray(mailing_lists) || mailing_lists.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-foreground">No mailing lists found!</p>
      </div>
    );
  }

  return (
    <ul className="w-full grow">
      {mailing_lists.map(
        (mailing_list: MailingListDefinition): ReactElement => {
          return (
            <li
              key={mailing_list.mailing_list_id}
              className={cn(
                "w-full p-2 md:p-4",
                "flex flex-col gap-2",
                "border rounded-md",
                "bg-card shadow-md",
              )}
            >
              <p className="text-md font-bold text-foreground">
                {mailing_list.name}
              </p>
              <p className="text-sm text-accent">{mailing_list.description}</p>
            </li>
          );
        },
      )}
    </ul>
  );
}

export default AvailableMailingLists;
