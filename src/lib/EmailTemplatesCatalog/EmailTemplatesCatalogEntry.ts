import type { FC, ReactNode } from "react";

export interface IEmailTemplatesCatalogEntry<TemplateProps> {
  id: string;
  renderTemplate: (props: TemplateProps) => Promise<ReactNode>;
  renderPlainTextVersion: (props: TemplateProps) => Promise<string>;
}

export abstract class EmailTemplatesCatalogEntry<TemplateProps>
  implements IEmailTemplatesCatalogEntry<TemplateProps>
{
  public abstract id: string;

  protected abstract loadReactEmailTemplate(): Promise<FC<TemplateProps>>;

  protected abstract validateProps(val: unknown): val is TemplateProps;

  public abstract renderPlainTextVersion(props: TemplateProps): Promise<string>;

  public async renderTemplate(props: TemplateProps): Promise<ReactNode> {
    let TemplateComponent: FC<TemplateProps>;
    try {
      TemplateComponent = await this.loadReactEmailTemplate();
    } catch (e: unknown) {
      console.error("Failed to load email template: ", e);
      throw new Error(`Failed to load email template for '${this.id}'`);
    }

    let isValidProps: boolean;
    try {
      isValidProps = this.validateProps(props);
    } catch (e: unknown) {
      console.error(
        "Error while attempting to validate inputs for email template: ",
        e,
      );
      throw new Error(
        "Error while attempting to validate inputs for email template!",
      );
    }

    if (!isValidProps) {
      throw new Error(`Invalid inputs to email template '${this.id}'`);
    }

    return TemplateComponent(props);
  }
}

export default EmailTemplatesCatalogEntry;
