import { z } from "zod";
import isValidTemplateId from "./isValidTemplateId";

export const emailTemplateIdSchema = z.string().refine(isValidTemplateId);

export default emailTemplateIdSchema;
