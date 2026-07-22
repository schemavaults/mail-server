import type {
  Insertable,
  Selectable,
  Updateable,
} from "@schemavaults/dbh";
import z from "zod";

/**
 * Validates a web origin of the form scheme://host[:port] — no path, query,
 * fragment, or trailing slash — so stored values compare exactly against the
 * `Origin` request header sent by browsers.
 */
export const corsOriginValueSchema = z
  .string()
  .min(1)
  .max(255)
  .refine((val) => {
    try {
      return new URL(val).origin === val;
    } catch {
      return false;
    }
  }, "Must be a web origin of the form scheme://host[:port] with no path or trailing slash.");

export const corsAllowedOriginRowSchema = z.object({
  cors_origin_id: z.string().uuid(),
  origin: corsOriginValueSchema,
  description: z.string().max(255).nullable(),
  created_at: z.number().nonnegative(),
  created_by_user_id: z.string().min(1),
});

export type CorsAllowedOriginsTable = z.infer<
  typeof corsAllowedOriginRowSchema
>;

export type CorsAllowedOrigin = Selectable<CorsAllowedOriginsTable>;
export type NewCorsAllowedOrigin = Insertable<CorsAllowedOriginsTable>;
export type CorsAllowedOriginUpdate = Updateable<CorsAllowedOriginsTable>;
