import { InternalRoute } from "./models/route.js";

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
}

export interface OpenApiParameter {
  name: string;
  in: "path" | "query";
  required: boolean;
  schema: { type: "string" };
}

export interface OpenApiRequestBody {
  required: true;
  content: {
    "application/json": {
      schema: { type: "object" };
    };
  };
}

export interface OpenApiOperation {
  summary?: string;
  description?: string;
  deprecated?: boolean;
  tags?: string[];
  parameters: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, { description: string }>;
}

export interface OpenApiDocument {
  openapi: "3.0.0";
  info: OpenApiInfo;
  paths: Record<string, Record<string, OpenApiOperation>>;
}

export function toOpenApi(
  routes: InternalRoute[],
  info?: Partial<OpenApiInfo>
): OpenApiDocument {
  const openApiInfo: OpenApiInfo = {
    title: info?.title || "API Documentation",
    version: info?.version || "1.0.0",
    ...(info?.description ? { description: info.description } : {}),
  };

  const paths: Record<string, Record<string, OpenApiOperation>> = {};

  for (const route of routes) {
    // Convert Express :paramName to OpenAPI {paramName}
    const openApiPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");

    // Extract path param names
    const paramMatches = Array.from(route.path.matchAll(/:([a-zA-Z0-9_]+)/g));
    const parameters: OpenApiParameter[] = paramMatches
      .map((m) => m[1])
      .filter((name): name is string => Boolean(name))
      .map((name) => ({
        name,
        in: "path",
        required: true,
        schema: { type: "string" },
      }));

    const methodLower = route.method.toLowerCase();

    const operation: OpenApiOperation = {
      parameters,
      responses: {
        "200": { description: "Success" },
        default: { description: "Error" },
      },
    };

    if (route.description) {
      operation.description = route.description;
    }
    if (route.deprecated) {
      operation.deprecated = true;
    }
    if (route.tags && route.tags.length > 0) {
      operation.tags = route.tags;
    }

    if (["post", "put", "patch"].includes(methodLower)) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      };
    }

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    paths[openApiPath][methodLower] = operation;
  }

  return {
    openapi: "3.0.0",
    info: openApiInfo,
    paths,
  };
}
