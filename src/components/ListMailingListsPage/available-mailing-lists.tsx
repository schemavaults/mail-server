"use client";

import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { cn } from "@schemavaults/ui";
import type { ReactElement } from "react";
import NewMailingListDialog from "@/components/NewMailingListDialog";
import JoinMailingListDialog from "@/components/JoinMailingListDialog";
import { useAdmin } from "@schemavaults/auth-react-provider";
import AvailableMailingListItem from "./available-mailing-list-item";

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
      <ul className="w-full grow mb-4">
        {mailing_lists.map(
          (mailing_list: MailingListDefinition): ReactElement => {
            return (
              <AvailableMailingListItem
                key={mailing_list.mailing_list_id}
                mailing_list={mailing_list}
              />
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
