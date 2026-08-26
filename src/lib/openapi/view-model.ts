import type { OpenApiDocument } from "./document";

// Transforms the generated OpenAPI document into render-ready structures for
// the dedicated /docs reference UI (src/components/ApiDocs). Everything here
// is pure data-in/data-out — $ref resolution, 3.1 type-array handling, and
// example generation all happen server-side so the client components only
// walk simple typed trees.

/** A raw JSON-schema fragment, accessed defensively. */
type RawSchema = Record<string, unknown>;

/** Render-ready description of one schema node. */
export interface SchemaNodeVM {
  /** Human type label, e.g. "string", "object", "array of string". */
  typeLabel: string;
  /** Registered component name when this node came from a $ref. */
  refName?: string;
  description?: string;
  /** True when null is an accepted value alongside `typeLabel`. */
  nullable?: boolean;
  /** Extra facts worth surfacing: format, length/size bounds. */
  constraints?: string[];
  /** Stringified enum members (also used for a single const value). */
  enumValues?: string[];
  /** Stringified example value. */
  example?: string;
  /** Set by the parent object on its property nodes. */
  required?: boolean;
  /** Object properties, in declaration order. */
  properties?: { name: string; node: SchemaNodeVM }[];
  /** Value schema when the object accepts arbitrary keys (record types). */
  additionalProperties?: SchemaNodeVM;
  /** Array item schema. */
  items?: SchemaNodeVM;
  /** anyOf/oneOf union variants. */
  variants?: SchemaNodeVM[];
  /** True when resolution stopped at a ref already on the current path. */
  circular?: boolean;
}

export interface ParameterVM {
  name: string;
  location: "path" | "query" | "header" | "cookie";
  required: boolean;
  node: SchemaNodeVM;
}

/** One content-type entry of a request or response body. */
export interface MediaVM {
  contentType: string;
  schema: SchemaNodeVM | null;
}

export interface ResponseVM {
  status: string;
  description: string;
  media: MediaVM[];
}

export interface OperationVM {
  /** Stable anchor id, e.g. "post-api-send". */
  slug: string;
  /** Upper-case HTTP method. */
  method: string;
  path: string;
  summary?: string;
  description?: string;
  /** Labels of the security schemes accepted by this operation (any-of). */
  securityLabels: string[];
  parameters: ParameterVM[];
  requestBody: MediaVM[];
  requestBodyRequired: boolean;
  responses: ResponseVM[];
  /** Ready-to-copy curl invocation exercising this operation. */
  curlExample: string;
}

export interface TagGroupVM {
  name: string;
  description?: string;
  operations: OperationVM[];
}

export interface SecuritySchemeVM {
  /** Component name, e.g. "AdminJwtAuth". */
  name: string;
  /** Short human label, e.g. "Admin JWT". */
  label: string;
  description?: string;
}

export interface DocsViewModel {
  title: string;
  description?: string;
  version: string;
  serverUrl: string;
  contactEmail?: string;
  securitySchemes: SecuritySchemeVM[];
  tagGroups: TagGroupVM[];
}

/** Human labels for the security schemes registered in ./security.ts. */
const SECURITY_SCHEME_LABELS: Record<string, string> = {
  AdminJwtAuth: "Admin JWT",
  MailApiKeyAuth: "API key",
};

function isRecord(value: unknown): value is RawSchema {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function stringify(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

const METHOD_ORDER = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
] as const;

const MAX_SCHEMA_DEPTH = 12;

class SchemaResolver {
  private readonly components: RawSchema;

  constructor(doc: OpenApiDocument) {
    const components = isRecord(doc.components) ? doc.components : {};
    this.components = isRecord(components.schemas)
      ? (components.schemas as RawSchema)
      : {};
  }

  /** Follows a `#/components/schemas/X` pointer to its raw schema. */
  private deref(ref: string): { name: string; schema: RawSchema } | null {
    const prefix = "#/components/schemas/";
    if (!ref.startsWith(prefix)) return null;
    const name = ref.slice(prefix.length);
    const schema = this.components[name];
    return isRecord(schema) ? { name, schema } : null;
  }

  /**
   * Builds the render-ready node for a raw schema fragment, resolving $refs
   * inline (recording the component name) and guarding against cycles via
   * the set of ref names on the current resolution path.
   */
  build(
    raw: unknown,
    activeRefs: readonly string[] = [],
    depth = 0,
  ): SchemaNodeVM {
    if (!isRecord(raw) || depth > MAX_SCHEMA_DEPTH) {
      return { typeLabel: "any" };
    }

    // $ref → resolve inline, keeping the component name for display.
    const ref = asString(raw.$ref);
    if (ref !== undefined) {
      const resolved = this.deref(ref);
      if (!resolved) return { typeLabel: ref };
      if (activeRefs.includes(resolved.name)) {
        return { typeLabel: resolved.name, refName: resolved.name, circular: true };
      }
      const node = this.build(
        resolved.schema,
        [...activeRefs, resolved.name],
        depth + 1,
      );
      node.refName = resolved.name;
      return node;
    }

    // allOf → merge the parts (zod-to-openapi wraps a $ref in allOf when it
    // needs to attach sibling metadata like a description).
    if (Array.isArray(raw.allOf)) {
      const merged = this.mergeAllOf(raw, activeRefs, depth);
      if (merged) return merged;
    }

    // anyOf/oneOf → union variants. A lone `{type:"null"}` variant becomes
    // the `nullable` flag on the remaining node instead of a visible variant.
    const unionMembers = Array.isArray(raw.anyOf)
      ? raw.anyOf
      : Array.isArray(raw.oneOf)
        ? raw.oneOf
        : null;
    if (unionMembers) {
      const variants = unionMembers
        .filter(isRecord)
        .map((member) => this.build(member, activeRefs, depth + 1));
      const nonNull = variants.filter((v) => v.typeLabel !== "null");
      const nullable = nonNull.length !== variants.length;
      if (nonNull.length === 1) {
        const only: SchemaNodeVM = { ...(nonNull[0] as SchemaNodeVM) };
        if (nullable) only.nullable = true;
        this.applyCommonKeywords(only, raw);
        return only;
      }
      const node: SchemaNodeVM = {
        typeLabel: `one of ${nonNull.length}`,
        variants: nonNull,
      };
      if (nullable) node.nullable = true;
      this.applyCommonKeywords(node, raw);
      return node;
    }

    return this.buildConcrete(raw, activeRefs, depth);
  }

  /** Merges `allOf: [...]` plus sibling keywords into one node. */
  private mergeAllOf(
    raw: RawSchema,
    activeRefs: readonly string[],
    depth: number,
  ): SchemaNodeVM | null {
    const parts = (raw.allOf as unknown[]).filter(isRecord);
    if (parts.length === 0) return null;
    const built = parts.map((part) => this.build(part, activeRefs, depth + 1));
    const base = built[0];
    if (base === undefined) return null;
    const node: SchemaNodeVM = { ...base };
    for (const extra of built.slice(1)) {
      if (extra.properties) {
        node.properties = [...(node.properties ?? []), ...extra.properties];
      }
      node.description = extra.description ?? node.description;
    }
    this.applyCommonKeywords(node, raw);
    return node;
  }

  /** Handles a plain (non-ref, non-combinator) schema fragment. */
  private buildConcrete(
    raw: RawSchema,
    activeRefs: readonly string[],
    depth: number,
  ): SchemaNodeVM {
    // OpenAPI 3.1 allows `type` to be an array, e.g. ["number", "null"].
    const rawType = raw.type;
    const types: string[] = Array.isArray(rawType)
      ? rawType.filter((t): t is string => typeof t === "string")
      : typeof rawType === "string"
        ? [rawType]
        : [];
    const nullable = types.includes("null");
    const mainTypes = types.filter((t) => t !== "null");
    const mainType =
      mainTypes[0] ??
      (isRecord(raw.properties)
        ? "object"
        : isRecord(raw.items)
          ? "array"
          : undefined);

    const node: SchemaNodeVM = {
      typeLabel: mainType ?? (types.length > 0 ? types.join(" | ") : "any"),
    };
    if (nullable) node.nullable = true;

    if (mainType === "object") {
      const requiredNames = new Set(
        Array.isArray(raw.required)
          ? raw.required.filter((n): n is string => typeof n === "string")
          : [],
      );
      if (isRecord(raw.properties)) {
        node.properties = Object.entries(raw.properties).map(
          ([name, propSchema]) => {
            const propNode = this.build(propSchema, activeRefs, depth + 1);
            if (requiredNames.has(name)) propNode.required = true;
            return { name, node: propNode };
          },
        );
      }
      if (isRecord(raw.additionalProperties)) {
        node.additionalProperties = this.build(
          raw.additionalProperties,
          activeRefs,
          depth + 1,
        );
      }
    }

    if (mainType === "array" && isRecord(raw.items)) {
      node.items = this.build(raw.items, activeRefs, depth + 1);
      node.typeLabel = `array of ${node.items.typeLabel}`;
    }

    this.applyCommonKeywords(node, raw);
    return node;
  }

  /** Copies description/enum/example/constraint keywords onto a node. */
  private applyCommonKeywords(node: SchemaNodeVM, raw: RawSchema): void {
    node.description = asString(raw.description) ?? node.description;

    if (Array.isArray(raw.enum)) {
      node.enumValues = raw.enum.map(stringify);
    } else if (raw.const !== undefined) {
      node.enumValues = [stringify(raw.const)];
    }

    if (raw.example !== undefined) {
      node.example = stringify(raw.example);
    } else if (Array.isArray(raw.examples) && raw.examples.length > 0) {
      node.example = stringify(raw.examples[0]);
    }

    const constraints: string[] = [];
    const format = asString(raw.format);
    if (format) constraints.push(format);
    if (typeof raw.minLength === "number")
      constraints.push(`min length ${raw.minLength}`);
    if (typeof raw.maxLength === "number")
      constraints.push(`max length ${raw.maxLength}`);
    if (typeof raw.minimum === "number")
      constraints.push(`min ${raw.minimum}`);
    if (typeof raw.maximum === "number")
      constraints.push(`max ${raw.maximum}`);
    if (typeof raw.minItems === "number")
      constraints.push(`min items ${raw.minItems}`);
    if (typeof raw.maxItems === "number")
      constraints.push(`max items ${raw.maxItems}`);
    if (constraints.length > 0) {
      node.constraints = [...(node.constraints ?? []), ...constraints];
    }
  }
}

/** Placeholder example value for one schema node, for the curl samples. */
export function exampleFromSchemaNode(node: SchemaNodeVM): unknown {
  if (node.example !== undefined) {
    try {
      return JSON.parse(node.example);
    } catch {
      return node.example;
    }
  }
  if (node.enumValues && node.enumValues.length > 0) {
    const first = node.enumValues[0] as string;
    try {
      return JSON.parse(first);
    } catch {
      return first;
    }
  }
  if (node.variants && node.variants.length > 0) {
    return exampleFromSchemaNode(node.variants[0] as SchemaNodeVM);
  }
  if (node.properties) {
    const example: Record<string, unknown> = {};
    for (const { name, node: propNode } of node.properties) {
      const value = exampleFromSchemaNode(propNode);
      // Skip optional properties with no meaningful placeholder (e.g. a
      // z.unknown() prop) instead of emitting `"key": null`.
      if (value === null && propNode.required !== true) continue;
      example[name] = value;
    }
    return example;
  }
  if (node.items) {
    return [exampleFromSchemaNode(node.items)];
  }
  const baseType = node.typeLabel.startsWith("array")
    ? "array"
    : node.typeLabel;
  switch (baseType) {
    case "string": {
      const format = node.constraints?.[0];
      if (format === "email") return "user@example.com";
      if (format === "uuid") return "00000000-0000-0000-0000-000000000000";
      if (format === "uri" || format === "url") return "https://example.com";
      return "string";
    }
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return true;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return null;
  }
}

/** Shell-quotes a value for embedding in a single-quoted curl argument. */
function shellSingleQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function buildCurlExample(
  serverUrl: string,
  method: string,
  path: string,
  operation: Pick<
    OperationVM,
    "securityLabels" | "parameters" | "requestBody"
  >,
): string {
  // Substitute path params ({api_key_id} → <api_key_id>) and append required
  // query params so the sample is runnable after filling the placeholders.
  let url = `${serverUrl}${path.replaceAll(/\{([^}]+)\}/g, "<$1>")}`;
  const requiredQuery = operation.parameters.filter(
    (p) => p.location === "query" && p.required,
  );
  if (requiredQuery.length > 0) {
    url += `?${requiredQuery.map((p) => `${p.name}=<${p.name}>`).join("&")}`;
  }

  const lines: string[] = [`curl -X ${method} ${shellSingleQuote(url)}`];
  if (operation.securityLabels.length > 0) {
    lines.push(`-H 'Authorization: Bearer <token>'`);
  }

  const jsonBody = operation.requestBody.find(
    (media) => media.contentType === "application/json",
  );
  const formBody = operation.requestBody.find((media) =>
    media.contentType.startsWith("multipart/"),
  );
  if (jsonBody?.schema) {
    lines.push(`-H 'Content-Type: application/json'`);
    const example = JSON.stringify(
      exampleFromSchemaNode(jsonBody.schema),
      null,
      2,
    );
    lines.push(`-d ${shellSingleQuote(example)}`);
  } else if (formBody?.schema) {
    for (const { name } of formBody.schema.properties ?? []) {
      lines.push(`-F ${shellSingleQuote(`${name}=@./<${name}>`)}`);
    }
  }

  return lines.join(" \\\n  ");
}

function buildMedia(
  resolver: SchemaResolver,
  content: unknown,
): MediaVM[] {
  if (!isRecord(content)) return [];
  return Object.entries(content).map(([contentType, mediaObject]) => ({
    contentType,
    schema:
      isRecord(mediaObject) && mediaObject.schema !== undefined
        ? resolver.build(mediaObject.schema)
        : null,
  }));
}

function buildParameters(
  resolver: SchemaResolver,
  parameters: unknown,
): ParameterVM[] {
  if (!Array.isArray(parameters)) return [];
  const result: ParameterVM[] = [];
  for (const parameter of parameters) {
    if (!isRecord(parameter)) continue;
    const name = asString(parameter.name);
    const location = asString(parameter.in);
    if (!name || !location) continue;
    result.push({
      name,
      location: location as ParameterVM["location"],
      required: parameter.required === true,
      node: resolver.build(parameter.schema),
    });
  }
  return result;
}

function securityLabelsFor(security: unknown): string[] {
  if (!Array.isArray(security)) return [];
  const labels: string[] = [];
  for (const requirement of security) {
    if (!isRecord(requirement)) continue;
    for (const schemeName of Object.keys(requirement)) {
      const label = SECURITY_SCHEME_LABELS[schemeName] ?? schemeName;
      if (!labels.includes(label)) labels.push(label);
    }
  }
  return labels;
}

/**
 * Builds the /docs view model from the generated OpenAPI document.
 * Operations group under the document's tag list (registration order);
 * operations without a known tag land in an "Other" group at the end.
 */
export function buildDocsViewModel(doc: OpenApiDocument): DocsViewModel {
  const resolver = new SchemaResolver(doc);

  const serverUrl = doc.servers?.[0]?.url ?? "";

  const groups = new Map<string, TagGroupVM>();
  for (const tag of doc.tags ?? []) {
    groups.set(tag.name, {
      name: tag.name,
      description: tag.description,
      operations: [],
    });
  }

  for (const [path, pathItem] of Object.entries(doc.paths ?? {})) {
    if (!isRecord(pathItem)) continue;
    for (const method of METHOD_ORDER) {
      const operation = pathItem[method];
      if (!isRecord(operation)) continue;

      const securityLabels = securityLabelsFor(operation.security);
      const parameters = buildParameters(resolver, operation.parameters);
      const rawBody = isRecord(operation.requestBody)
        ? operation.requestBody
        : null;
      const requestBody = buildMedia(resolver, rawBody?.content);

      const responses: ResponseVM[] = [];
      if (isRecord(operation.responses)) {
        for (const [status, response] of Object.entries(operation.responses)) {
          if (!isRecord(response)) continue;
          responses.push({
            status,
            description: asString(response.description) ?? "",
            media: buildMedia(resolver, response.content),
          });
        }
      }

      const methodUpper = method.toUpperCase();
      const operationVM: OperationVM = {
        slug: `${method}-${path.replaceAll(/[^a-zA-Z0-9]+/g, "-").replaceAll(/^-|-$/g, "")}`,
        method: methodUpper,
        path,
        summary: asString(operation.summary),
        description: asString(operation.description),
        securityLabels,
        parameters,
        requestBody,
        requestBodyRequired: rawBody?.required === true,
        responses,
        curlExample: buildCurlExample(serverUrl, methodUpper, path, {
          securityLabels,
          parameters,
          requestBody,
        }),
      };

      const tags = Array.isArray(operation.tags)
        ? operation.tags.filter((t): t is string => typeof t === "string")
        : [];
      const groupName = tags[0] ?? "Other";
      let group = groups.get(groupName);
      if (!group) {
        group = { name: groupName, operations: [] };
        groups.set(groupName, group);
      }
      group.operations.push(operationVM);
    }
  }

  const securitySchemes: SecuritySchemeVM[] = [];
  const rawSchemes = isRecord(doc.components)
    ? doc.components.securitySchemes
    : undefined;
  if (isRecord(rawSchemes)) {
    for (const [name, scheme] of Object.entries(rawSchemes)) {
      if (!isRecord(scheme)) continue;
      securitySchemes.push({
        name,
        label: SECURITY_SCHEME_LABELS[name] ?? name,
        description: asString(scheme.description),
      });
    }
  }

  return {
    title: doc.info.title,
    description: doc.info.description,
    version: doc.info.version,
    serverUrl,
    contactEmail: asString(
      isRecord(doc.info.contact) ? doc.info.contact.email : undefined,
    ),
    securitySchemes,
    tagGroups: [...groups.values()].filter(
      (group) => group.operations.length > 0,
    ),
  };
}

export default buildDocsViewModel;
