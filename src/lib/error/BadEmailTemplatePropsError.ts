export class BadEmailTemplatePropsError extends Error {
  public constructor() {
    super("Received invalid template props for template!");
  }
}

export default BadEmailTemplatePropsError;
