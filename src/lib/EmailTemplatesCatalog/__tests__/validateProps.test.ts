import { describe, expect, test } from "bun:test";
import EmailTemplatesCatalog, {
  type EmailTemplateId,
} from "../EmailTemplatesCatalog";
import sampleEmailTemplateProps from "../sampleProps";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";

const templateIds = Object.keys(EmailTemplatesCatalog) as EmailTemplateId[];

describe("EmailTemplatesCatalog sampleProps", () => {
  test("covers every template in the catalog", () => {
    const sampleIds = Object.keys(sampleEmailTemplateProps).sort();
    const catalogIds = [...templateIds].sort();
    expect(sampleIds).toEqual(catalogIds);
  });

  for (const templateId of templateIds) {
    test(`'${templateId}' validateProps accepts its sample props`, async () => {
      const CatalogEntry = await EmailTemplatesCatalog[templateId]();
      const template = new CatalogEntry();
      const sample = sampleEmailTemplateProps[templateId];

      expect(sample).toBeDefined();

      let result: boolean;
      try {
        result = template.validateProps(sample);
      } catch (e: unknown) {
        const detail =
          e instanceof BadEmailTemplatePropsError
            ? e.message
            : e instanceof Error
              ? `${e.name}: ${e.message}`
              : String(e);
        throw new Error(
          `validateProps threw for sample props of '${templateId}': ${detail}`,
        );
      }
      expect(result).toBe(true);
    });
  }
});
