export class BadEmailTemplatePropsError extends Error {
  public constructor(message: string = "Received invalid template props for template!") {
    super(message);
    this.name = "BadEmailTemplatePropsError";
  }
}

export default BadEmailTemplatePropsError;
