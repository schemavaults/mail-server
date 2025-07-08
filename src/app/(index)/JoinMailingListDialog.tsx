"use client";

import { useCallback, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@schemavaults/ui";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@schemavaults/ui";
import { Button } from "@schemavaults/ui";
import { Input } from "@schemavaults/ui";
import { useToast } from "@schemavaults/ui";

import joinMailingList from "@/lib/client-mail-db-actions/joinMailingList";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import {
  SelectedMailingListToJoinContext,
  SelectMailingListToJoinDispatchContext,
} from "./SelectedMailingListToJoinContext";
import { CalendarSync } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
});

interface JoinMailingListDialogProps {}

export default function JoinMailingListDialog({}: JoinMailingListDialogProps) {
  const selectedMailingList: MailingListDefinition | null = useContext(
    SelectedMailingListToJoinContext,
  );
  const setSelectedMailingList = useContext(
    SelectMailingListToJoinDispatchContext,
  );
  const { toast } = useToast();

  const close = useCallback(() => {
    setSelectedMailingList(null);
  }, [setSelectedMailingList]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const mailingList = selectedMailingList;
    if (!mailingList) {
      toast({
        variant: "destructive",
        title: "Failed to load mailing list data from context!",
        description: "Please refresh the page and try again!",
      });
      return;
    }

    try {
      await joinMailingList(mailingList.mailing_list_id, values.email);
      toast({
        title: "You’ve successfully joined the mailing list!",
        description: `Successfully joined ${mailingList.name}.`,
      });
      close();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error joining mailing list",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const mailingListTitle: string | undefined = selectedMailingList?.name;

  return (
    <Dialog
      open={!!selectedMailingList}
      onOpenChange={(newOpenState: boolean) => {
        if (!newOpenState) {
          close();
        }
      }}
    >
      {mailingListTitle && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Join the ${mailingListTitle} mailing list`}</DialogTitle>
            <DialogDescription>
              Enter your email to subscribe to new e-mails from the{" "}
              {`${mailingListTitle}`} mailing list.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="flex flex-row gap-2 flex-nowrap"
                >
                  <CalendarSync className="h-6 w-6" /> Subscribe
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}
