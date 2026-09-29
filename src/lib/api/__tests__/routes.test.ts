import { describe, expect, it } from "bun:test";
import path from "node:path";
import { checkNextAppRouterRoutes } from "@schemavaults/openapi-operations/nextjs/app-router-routes";
import { MAIL_SERVER_OPERATIONS } from "../operations";

describe("API route files", () => {
  it("serve exactly the operations catalogue", async () => {
    const report = await checkNextAppRouterRoutes({
      operations: MAIL_SERVER_OPERATIONS,
      appDirectory: path.resolve(import.meta.dir, "../../../app"),
      // Serves the OpenAPI document itself rather than an operation.
      ignoredRoutePaths: ["/api/openapi.json"],
      catalogueLabel: "MAIL_SERVER_OPERATIONS",
    });
    expect(report.problems).toEqual([]);
    expect(report.operationFiles.length).toBeGreaterThan(0);
  });
});
