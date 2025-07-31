import {
  EmailTemplatesCatalog,
  type EmailTemplateId,
} from "./EmailTemplatesCatalog";

export function isValidTemplateId(val: string): val is EmailTemplateId {
  const keys: readonly string[] = Object.keys(EmailTemplatesCatalog);
  if (keys.includes(val)) {
    return true;
  }
  return false;
}

export default isValidTemplateId;
