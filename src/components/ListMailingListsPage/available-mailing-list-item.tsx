"use client";

import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import type { ReactElement } from "react";
import { OpenJoinMailingListDialogButton } from "./OpenJoinMailingListDialogButton";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useToast,
} from "@schemavaults/ui";
import { useAdmin } from "@schemavaults/auth-react-provider";
import { ClipboardCopy, EllipsisVertical, Users } from "lucide-react";
import Link from "next/link";
import copyToClipboard from "@/lib/copyToClipboard";

function AdditionalMailingListItemActions({
  mailing_list,
}: {
  mailing_list: MailingListDefinition;
}): ReactElement {
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <EllipsisVertical className="h-6 w-6" />
          <span className="sr-only">
            Open Additional Mailing List Item Actions Menu
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Mailing List Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e): void => {
              e.preventDefault();
              const mailing_list_id: string = mailing_list.mailing_list_id;
              copyToClipboard(mailing_list_id)
                .then((): void => {
                  toast({
                    title: "Copied mailing list ID to clipboard successfully!",
                    description: `You may now paste: '${mailing_list_id}'`,
                  });
                })
                .catch((e: unknown): void => {
                  toast({
                    title: "Error copying mailing list ID to clipboard!",
                    description:
                      e instanceof Error
                        ? e.message
                        : "An unknown error has occurred!",
                  });
                });
            }}
          >
            <ClipboardCopy className="h-4 w-4 mr-2" /> Copy Mailing List ID
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/admin/subscribers/${mailing_list.mailing_list_id}`}>
              <Users className="h-4 w-4 mr-2" /> View Subscribers
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AvailableMailingListItem({
  mailing_list,
}: {
  mailing_list: MailingListDefinition;
}): ReactElement {
  const mailing_list_id: string = mailing_list.mailing_list_id;
  const admin: boolean = useAdmin();

  return (
    <li
      key={mailing_list_id}
      className={cn(
        "w-full p-2 md:p-4",
        "flex flex-col md:flex-row gap-2",
        "border border-border rounded-md",
        "bg-card shadow-md",
        "overflow-hidden",
      )}
    >
      <div className={cn("flex flex-col gap-2", "grow")}>
        <p className="text-md font-bold text-foreground">{mailing_list.name}</p>
        <p className="text-sm text-foreground">{mailing_list.description}</p>
      </div>
      <div
        className={cn("flex flex-row flex-wrap gap-2 shrink-0 items-center")}
      >
        <OpenJoinMailingListDialogButton mailing_list={mailing_list} />
        {admin && (
          <AdditionalMailingListItemActions mailing_list={mailing_list} />
        )}
      </div>
    </li>
  );
}
