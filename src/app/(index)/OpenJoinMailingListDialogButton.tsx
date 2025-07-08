"use client";

import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { Button } from "@schemavaults/ui";
import { CalendarPlus } from "lucide-react";
import { useContext } from "react";
import { SelectMailingListToJoinDispatchContext } from "./SelectedMailingListToJoinContext";

export function OpenJoinMailingListDialogButton({
  mailing_list,
}: {
  mailing_list: MailingListDefinition;
}) {
  const setSelected = useContext(SelectMailingListToJoinDispatchContext);

  return (
    <Button
      className="flex flex-row gap-2 justify-start items-center"
      onClick={(e): void => {
        e.preventDefault();
        setSelected(mailing_list);
      }}
    >
      <CalendarPlus className="h-w w-6" />
      Join
    </Button>
  );
}
