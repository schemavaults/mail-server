"use client";

import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { cn } from "@schemavaults/ui";
import type { ReactElement } from "react";
import NewMailingListDialog from "@/components/NewMailingListDialog";
import JoinMailingListDialog from "./JoinMailingListDialog";
import { useAdmin } from "@schemavaults/auth-react-provider";
import { OpenJoinMailingListDialogButton } from "./OpenJoinMailingListDialogButton";

export interface AvailableMailingListsViewProps {
  mailing_lists: readonly MailingListDefinition[];
}

function AvailableMailingLists({
  mailing_lists,
}: AvailableMailingListsViewProps): ReactElement {
  const admin: boolean = useAdmin();

  if (!Array.isArray(mailing_lists) || mailing_lists.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center w-full grow",
          "gap-2 md:gap-4",
        )}
      >
        <p className="text-foreground select-none">No mailing lists found!</p>
        {admin && <NewMailingListDialog />}
      </div>
    );
  }

  return (
    <div className="w-full grow flex flex-col items-start justify-start flex-nowrap">
      <ul className="w-full grow">
        {mailing_lists.map(
          (mailing_list: MailingListDefinition): ReactElement => {
            const mailing_list_id: string = mailing_list.mailing_list_id;
            return (
              <li
                key={mailing_list_id}
                className={cn(
                  "w-full p-2 md:p-4",
                  "flex flex-col md:flex-row gap-2",
                  "border rounded-md",
                  "bg-card shadow-md",
                )}
              >
                <div className={cn("flex flex-col gap-2", "grow")}>
                  <p className="text-md font-bold text-foreground">
                    {mailing_list.name}
                  </p>
                  <p className="text-sm text-foreground">
                    {mailing_list.description}
                  </p>
                </div>
                <div className={cn("flex flex-row gap-2")}>
                  <OpenJoinMailingListDialogButton
                    mailing_list={mailing_list}
                  />
                </div>
              </li>
            );
          },
        )}
      </ul>
      {admin && <NewMailingListDialog />}
      <JoinMailingListDialog />
    </div>
  );
}

export default AvailableMailingLists;
