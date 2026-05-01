import type { FC, ReactNode } from "react";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";

export interface IEmailTemplatesCatalogEntry<TemplateProps> {
  id: string;
  description: string;
  renderTemplate: (props: TemplateProps) => Promise<ReactNode>;
  renderPlainTextVersion: (props: TemplateProps) => Promise<string>;
}

export abstract class EmailTemplatesCatalogEntry<TemplateProps>
  implements IEmailTemplatesCatalogEntry<TemplateProps>
{
  public abstract id: string;

  public abstract description: string;

  protected abstract loadReactEmailTemplate(): Promise<FC<TemplateProps>>;

  /**
   * Validates `val` and narrows it to `TemplateProps` on success. On failure,
   * throws `BadEmailTemplatePropsError` whose `message` describes which prop
   * was invalid; that message is considered safe to surface to the caller.
   */
  public abstract validateProps(val: unknown): val is TemplateProps;

  public abstract renderPlainTextVersion(props: TemplateProps): Promise<string>;

  public async renderTemplate(props: TemplateProps): Promise<ReactNode> {
    let TemplateComponent: FC<TemplateProps>;
    try {
      TemplateComponent = await this.loadReactEmailTemplate();
    } catch (e: unknown) {
      console.error("Failed to load email template: ", e);
      throw new Error(`Failed to load email template for '${this.id}'`);
    }

    try {
      if (!this.validateProps(props)) {
        throw new BadEmailTemplatePropsError(
          `Invalid inputs to email template '${this.id}'`,
        );
      }
    } catch (e: unknown) {
      if (e instanceof BadEmailTemplatePropsError) {
        throw e;
      }
      console.error(
        "Error while attempting to validate inputs for email template: ",
        e,
      );
      throw new Error(
        "Error while attempting to validate inputs for email template!",
      );
    }

    return TemplateComponent(props);
  }
}

export default EmailTemplatesCatalogEntry;
