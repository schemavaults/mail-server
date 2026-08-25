import { describe, expect, it } from "bun:test";
import { buildOpenApiDocument } from "../document";
import {
  buildDocsViewModel,
  exampleFromSchemaNode,
  type OperationVM,
} from "../view-model";

describe("buildDocsViewModel", () => {
  const doc = buildOpenApiDocument();
  const vm = buildDocsViewModel(doc);

  const allOperations: OperationVM[] = vm.tagGroups.flatMap(
    (group) => group.operations,
  );
  const findOperation = (method: string, path: string): OperationVM => {
    const operation = allOperations.find(
      (op) => op.method === method && op.path === path,
    );
    if (!operation) throw new Error(`missing operation ${method} ${path}`);
    return operation;
  };

  it("covers every documented operation, grouped under the document tags", () => {
    const totalDocumented = Object.values(doc.paths ?? {}).reduce(
      (count, pathItem) =>
        count +
        Object.keys(pathItem as object).filter((key) =>
          ["get", "post", "put", "patch", "delete"].includes(key),
        ).length,
      0,
    );
    expect(allOperations.length).toBe(totalDocumented);
    // No group is empty, and none of ours fell into the "Other" bucket.
    expect(vm.tagGroups.every((g) => g.operations.length > 0)).toBe(true);
    expect(vm.tagGroups.map((g) => g.name)).not.toContain("Other");
  });

  it("resolves $refs into named schema trees", () => {
    const send = findOperation("POST", "/api/send");
    const json = send.requestBody.find(
      (media) => media.contentType === "application/json",
    );
    expect(json?.schema?.refName).toBe("SendEmailRequestBody");
    expect(json?.schema?.typeLabel).toBe("object");
    const to = json?.schema?.properties?.find((p) => p.name === "to");
    expect(to?.node.required).toBe(true);
    expect((to?.node.variants?.length ?? 0)).toBeGreaterThan(1);
  });

  it("marks nullable fields from 3.1 type arrays", () => {
    const list = findOperation("GET", "/api/admin/api-keys");
    const media = list.responses.find((r) => r.status === "200")?.media[0];
    const data = media?.schema?.properties?.find((p) => p.name === "data");
    const record = data?.node.items;
    expect(record?.refName).toBe("ApiKeyRecord");
    const lastUsed = record?.properties?.find((p) => p.name === "last_used_at");
    expect(lastUsed?.node.nullable).toBe(true);
  });

  it("exposes path parameters with their schemas", () => {
    const patch = findOperation("PATCH", "/api/admin/api-keys/{api_key_id}");
    const param = patch.parameters.find((p) => p.name === "api_key_id");
    expect(param?.location).toBe("path");
    expect(param?.required).toBe(true);
    expect(param?.node.constraints).toContain("uuid");
  });

  it("builds runnable curl examples", () => {
    const join = findOperation("POST", "/api/mailing-lists/join");
    expect(join.curlExample).toContain("curl -X POST");
    expect(join.curlExample).toContain("/api/mailing-lists/join");
    expect(join.curlExample).toContain("Content-Type: application/json");
    // Public route: no Authorization header.
    expect(join.curlExample).not.toContain("Authorization");

    const send = findOperation("POST", "/api/send");
    expect(send.curlExample).toContain("Authorization: Bearer <token>");

    const del = findOperation("DELETE", "/api/admin/api-keys/{api_key_id}");
    expect(del.curlExample).toContain("<api_key_id>");
    expect(del.curlExample).not.toContain("{api_key_id}");

    const subscribers = findOperation("GET", "/api/mailing-lists/subscribers");
    expect(subscribers.curlExample).toContain(
      "?mailing_list_id=<mailing_list_id>",
    );

    const upload = findOperation("PUT", "/api/admin/branding/{asset_kind}");
    expect(upload.curlExample).toContain("-F 'file=@./<file>'");
  });

  it("labels the security schemes", () => {
    expect(vm.securitySchemes.map((s) => s.label).sort()).toEqual([
      "API key",
      "Admin JWT",
    ]);
    const send = findOperation("POST", "/api/send");
    expect(send.securityLabels).toEqual(["Admin JWT", "API key"]);
    const join = findOperation("POST", "/api/mailing-lists/join");
    expect(join.securityLabels).toEqual([]);
  });

  it("generates examples honoring schema examples, enums, and formats", () => {
    const join = findOperation("POST", "/api/mailing-lists/join");
    const schema = join.requestBody[0]?.schema;
    expect(schema).toBeDefined();
    const example = exampleFromSchemaNode(schema!) as Record<string, unknown>;
    expect(example.email).toBe("subscriber@example.com");
    expect(typeof example.mailing_list_id).toBe("string");
  });

  it("carries document metadata", () => {
    expect(vm.title).toContain("Mail Server API");
    expect(vm.version.length).toBeGreaterThan(0);
    expect(vm.serverUrl.length).toBeGreaterThan(0);
  });
});
