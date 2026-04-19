"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import {
  Button,
  Checkbox,
  cn,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  useForm,
  useToast,
} from "@schemavaults/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import type { SendEmailRequestBody } from "@schemavaults/send-email";
import sendEmail from "@/lib/client-mail-db-actions/sendEmail";

const emailOrEmpty = z
  .string()
  .optional()
  .refine(
    (v) => !v || z.string().email().safeParse(v).success,
    "Must be a valid email address",
  );

const formSchema = z
  .object({
    from: emailOrEmpty,
    to: z.string().nonempty("Please provide at least one recipient."),
    replyTo: emailOrEmpty,
    cc: z.string().optional(),
    bcc: z.string().optional(),
    subject: z.string().nonempty("Please provide a subject."),
    mode: z.enum(["template", "raw"]),
    template_id: z.string().optional(),
    template_props_json: z.string().optional(),
    text: z.string().optional(),
    html: z.string().optional(),
    dryRun: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "template") {
      if (!v.template_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["template_id"],
          message: "Please choose a template.",
        });
      }
    } else {
      if (!v.text && !v.html) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["text"],
          message: "Provide text and/or HTML body.",
        });
      }
    }
  });

type SendEmailFormValues = z.infer<typeof formSchema>;

function splitAddressList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function toRecipientField(
  value: string | undefined,
): string | string[] | undefined {
  const parts = splitAddressList(value);
  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  return parts;
}

export interface SendEmailFormClientProps {
  templateIds: string[];
}

export default function SendEmailFormClient({
  templateIds,
}: SendEmailFormClientProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SendEmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: "",
      to: "",
      replyTo: "",
      cc: "",
      bcc: "",
      subject: "",
      mode: "template",
      template_id: templateIds[0] ?? "",
      template_props_json: "{}",
      text: "",
      html: "",
      dryRun: false,
    },
  });

  const mode = watch("mode");

  const onSubmit = async (formData: SendEmailFormValues): Promise<void> => {
    if (!auth.ready || !auth.client.current) {
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description: "Auth client is not ready!",
      });
      return;
    }
    const authClient: ISchemaVaultsAuthClient = auth.client.current;

    const toField = toRecipientField(formData.to);
    if (!toField) {
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description: "At least one recipient is required.",
      });
      return;
    }

    let message: SendEmailRequestBody["message"];
    if (formData.mode === "template") {
      if (!formData.template_id) {
        toast({
          variant: "destructive",
          title: "Failed to send email",
          description: "Please choose a template.",
        });
        return;
      }
      let template_props: unknown = undefined;
      const rawProps = formData.template_props_json?.trim();
      if (rawProps && rawProps.length > 0) {
        try {
          template_props = JSON.parse(rawProps);
        } catch (e: unknown) {
          toast({
            variant: "destructive",
            title: "Invalid template props JSON",
            description:
              e instanceof Error ? e.message : "Could not parse JSON.",
          });
          return;
        }
      }
      message = {
        template_id: formData.template_id,
        template_props,
      };
    } else {
      message = {
        text: formData.text ?? "",
        html: formData.html ?? "",
      };
    }

    const body: SendEmailRequestBody = {
      to: toField,
      subject: formData.subject,
      message,
    };
    const fromTrimmed = formData.from?.trim();
    if (fromTrimmed) body.from = fromTrimmed;
    const replyToTrimmed = formData.replyTo?.trim();
    if (replyToTrimmed) body.replyTo = replyToTrimmed;
    const ccField = toRecipientField(formData.cc);
    if (ccField) body.cc = ccField;
    const bccField = toRecipientField(formData.bcc);
    if (bccField) body.bcc = bccField;
    if (formData.dryRun) body.dryRun = true;

    try {
      await sendEmail(body, authClient);
    } catch (e: unknown) {
      console.error("Failed to send email: ", e);
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description:
          e instanceof Error ? e.message : "An unknown error has occurred!",
      });
      return;
    }

    toast({
      title: formData.dryRun ? "Dry run succeeded" : "Email sent",
      description: formData.dryRun
        ? "The request validated successfully; no email was dispatched."
        : "The email was dispatched successfully.",
    });
    reset({
      ...formData,
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      template_props_json: formData.template_props_json,
      text: "",
      html: "",
      dryRun: formData.dryRun,
    });
  };

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
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Admin</span>
        </Link>
        <h2 className="text-xl md:text-2xl text-foreground">Send Email</h2>
      </header>
      <Separator decorative orientation="horizontal" className="w-full" />
      <main
        className={cn(
          "w-full grow",
          "flex flex-col items-center justify-start",
          "p-4 md:p-8",
        )}
      >
        <form
          onSubmit={handleSubmit(onSubmit, (errs) => {
            console.error("Send email form submission error: ", errs);
            toast({
              variant: "destructive",
              title: "Form has errors",
              description: "Please correct the highlighted fields.",
            });
          })}
          className={cn(
            "w-full max-w-3xl",
            "flex flex-col gap-4",
            "p-4 md:p-6",
            "border rounded-md bg-card",
          )}
        >
          <div>
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="email"
              placeholder="Defaults to the configured sender if blank"
              {...register("from")}
            />
            {errors.from && (
              <p className="text-red-500 text-sm">{errors.from.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="to">
              To <span className="text-red-500">*</span>
            </Label>
            <Input
              id="to"
              placeholder="recipient@example.com (comma-separated for multiple)"
              {...register("to")}
            />
            {errors.to && (
              <p className="text-red-500 text-sm">{errors.to.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="replyTo">Reply-To</Label>
            <Input
              id="replyTo"
              type="email"
              placeholder="optional"
              {...register("replyTo")}
            />
            {errors.replyTo && (
              <p className="text-red-500 text-sm">{errors.replyTo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cc">CC</Label>
            <Input
              id="cc"
              placeholder="optional, comma-separated"
              {...register("cc")}
            />
            {errors.cc && (
              <p className="text-red-500 text-sm">{errors.cc.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bcc">BCC</Label>
            <Input
              id="bcc"
              placeholder="optional, comma-separated"
              {...register("bcc")}
            />
            {errors.bcc && (
              <p className="text-red-500 text-sm">{errors.bcc.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Email subject"
              {...register("subject")}
            />
            {errors.subject && (
              <p className="text-red-500 text-sm">{errors.subject.message}</p>
            )}
          </div>

          <Separator decorative orientation="horizontal" className="my-2" />

          <div>
            <Label>Message Type</Label>
            <div className="flex flex-row gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="template" {...register("mode")} />
                Template
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="raw" {...register("mode")} />
                Raw HTML / Plaintext
              </label>
            </div>
          </div>

          {mode === "template" ? (
            <>
              <div>
                <Label htmlFor="template_id">Template</Label>
                {templateIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No templates registered.
                  </p>
                ) : (
                  <Controller
                    control={control}
                    name="template_id"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="template_id" className="w-full">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templateIds.map((id) => (
                            <SelectItem key={id} value={id}>
                              {id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.template_id && (
                  <p className="text-red-500 text-sm">
                    {errors.template_id.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="template_props_json">
                  Template Props (JSON)
                </Label>
                <Textarea
                  id="template_props_json"
                  rows={6}
                  placeholder='{"name": "value"}'
                  className="font-mono text-sm"
                  {...register("template_props_json")}
                />
                {errors.template_props_json && (
                  <p className="text-red-500 text-sm">
                    {errors.template_props_json.message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="text">Plaintext Body</Label>
                <Textarea
                  id="text"
                  rows={6}
                  placeholder="Plaintext fallback body"
                  {...register("text")}
                />
                {errors.text && (
                  <p className="text-red-500 text-sm">{errors.text.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="html">HTML Body</Label>
                <Textarea
                  id="html"
                  rows={10}
                  placeholder="<p>Hello, world!</p>"
                  className="font-mono text-sm"
                  {...register("html")}
                />
                {errors.html && (
                  <p className="text-red-500 text-sm">{errors.html.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="dryRun"
              render={({ field }) => (
                <Checkbox
                  id="dryRun"
                  checked={field.value ?? false}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              )}
            />
            <Label htmlFor="dryRun">
              Dry run (validate without sending)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
