"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListPlus } from "lucide-react";
import { Checkbox, useForm, useToast } from "@schemavaults/ui";

// If you're using shadcn UI or a similar library, adjust these imports
// to match the components for your project:
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@schemavaults/ui";
import createMailingList from "@/lib/client-mail-db-actions/createMailingList";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";

const formSchema = z.object({
  name: z
    .string()
    .nonempty("Please provide a name for the mailing list.")
    .min(3, "Must be at least 3 characters.")
    .max(64, "Cannot exceed 64 characters."),
  description: z
    .string()
    .nonempty("Please provide a description.")
    .min(3, "Must be at least 3 characters.")
    .max(256, "Cannot exceed 256 characters."),
  public: z.boolean().default(true),
});

type NewMailingListFormValues = z.infer<typeof formSchema>;

export interface NewMailingListDialogProps {}

export function NewMailingListDialog({}: NewMailingListDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewMailingListFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      public: true,
    },
  });

  const onSubmit = async (formData: NewMailingListFormValues) => {
    if (!auth.ready || !auth.client.current) {
      toast({
        variant: "destructive",
        title: "Failed to create new mailing list",
        description: "Auth client is not ready!",
      });
      return;
    }
    const authClient: ISchemaVaultsAuthClient = auth.client.current;

    try {
      await createMailingList(formData, authClient);
    } catch (e: unknown) {
      console.error("Failed to create new mailing list: ", e);
      toast({
        variant: "destructive",
        title: "Failed to create new mailing list",
        description:
          e instanceof Error ? e.message : "An unknown error has occurred!",
      });
      return;
    }

    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex flex-row gap-2 flex-nowrap items-center"
        >
          <ListPlus className="h-5 w-5" />
          New Mailing List
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Mailing List</DialogTitle>
          <DialogDescription>
            Enter the details for your new mailing list.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(
            onSubmit,
            function onFormSubmitError(errs): void {
              console.warn(
                "There was an error attempting to submit the mailing list creation form: ",
                errs,
              );
              if (open) {
                toast({
                  variant: "destructive",
                  title:
                    "There was an error attempting to submit the mailing list creation form",
                  description: "Please ensure that your form inputs are valid!",
                });
              }
              return;
            },
          )}
          className="space-y-4 mt-4"
        >
          <div>
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              placeholder="Enter the mailing list name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter a short description"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="public" {...register("public")} />
            <Label htmlFor="public">Is this mailing list public?</Label>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewMailingListDialog;
