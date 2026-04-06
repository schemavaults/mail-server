import type { IEmailTemplatesCatalogEntry } from "./EmailTemplatesCatalogEntry";
import type EmailTemplatesCatalogEntry from "./EmailTemplatesCatalogEntry";

export const EmailTemplatesCatalog = {
  "my-test-email": async () =>
    import("./email-template-refs/MyTestEmail").then((m) => m.default),
  "password-reset": async () =>
    import("./email-template-refs/PasswordReset").then((m) => m.default),
};

export type EmailTemplateId = keyof typeof EmailTemplatesCatalog;

export type EmailTemplateCatalogEntryType<T extends EmailTemplateId> = Awaited<
  ReturnType<(typeof EmailTemplatesCatalog)[T]>
>;

export type EmailTemplatePropsType<T extends EmailTemplateId> = Parameters<
  InstanceType<EmailTemplateCatalogEntryType<T>>["renderTemplate"]
>[0];

export default EmailTemplatesCatalog;
