export class MailTransportConfigError extends Error {
  public constructor(message: string = "Invalid mail transport configuration!") {
    super(message);
    this.name = "MailTransportConfigError";
  }
}

export default MailTransportConfigError;
