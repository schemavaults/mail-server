"use client";

import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { createContext } from "react";

export const SelectedMailingListToJoinContext =
  createContext<MailingListDefinition | null>(null);

export const SelectMailingListToJoinDispatchContext = createContext<
  (newSelection: MailingListDefinition | null) => void
>(() => {
  throw new Error(
    "Not within <SelectMailingListToJoinDispatchContext.Provider> render tree!",
  );
});
