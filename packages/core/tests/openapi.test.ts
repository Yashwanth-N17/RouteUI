import { describe, expect, it } from "vitest";
import { toOpenApi } from "../src/openapi.js";
import { InternalRoute } from "../src/models/route.js";

describe("toOpenApi converter", () => {
  it("converts basic GET route and extracts path parameters", () => {
    const routes: InternalRoute[] = [
      {
        method: "GET",
        path: "/users/:id",
        handlers: ["getUser"],
        middleware: [],
        description: "Get user by ID",
      },
    ];

    const openApi = toOpenApi(routes, { title: "Test API", version: "1.2.3" });

    expect(openApi.openapi).toBe("3.0.0");
    expect(openApi.info.title).toBe("Test API");
    expect(openApi.info.version).toBe("1.2.3");
    expect(openApi.paths["/users/{id}"]).toBeDefined();

    const getOp = openApi.paths["/users/{id}"].get;
    expect(getOp).toBeDefined();
    expect(getOp.description).toBe("Get user by ID");
    expect(getOp.parameters).toHaveLength(1);
    expect(getOp.parameters[0]).toEqual({
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" },
    });
    expect(getOp.responses["200"]).toEqual({ description: "Success" });
    expect(getOp.responses.default).toEqual({ description: "Error" });
  });

  it("adds requestBody for POST, PUT, and PATCH routes", () => {
    const routes: InternalRoute[] = [
      {
        method: "POST",
        path: "/users",
        handlers: ["createUser"],
        middleware: [],
      },
    ];

    const openApi = toOpenApi(routes);
    const postOp = openApi.paths["/users"].post;
    expect(postOp).toBeDefined();
    expect(postOp.requestBody).toBeDefined();
    expect(postOp.requestBody?.required).toBe(true);
    expect(postOp.requestBody?.content["application/json"]).toEqual({
      schema: { type: "object" },
    });
  });

  it("groups multiple HTTP methods on the same path under one path key", () => {
    const routes: InternalRoute[] = [
      {
        method: "GET",
        path: "/items",
        handlers: ["listItems"],
        middleware: [],
      },
      {
        method: "POST",
        path: "/items",
        handlers: ["createItem"],
        middleware: [],
      },
    ];

    const openApi = toOpenApi(routes);
    expect(Object.keys(openApi.paths)).toEqual(["/items"]);
    expect(openApi.paths["/items"].get).toBeDefined();
    expect(openApi.paths["/items"].post).toBeDefined();
  });

  it("converts Express :param to OpenAPI {param} in path key and parameters array", () => {
    const routes: InternalRoute[] = [
      {
        method: "GET",
        path: "/orgs/:orgId/members/:memberId",
        handlers: ["getMember"],
        middleware: [],
      },
    ];

    const openApi = toOpenApi(routes);
    expect(openApi.paths["/orgs/{orgId}/members/{memberId}"]).toBeDefined();

    const getOp = openApi.paths["/orgs/{orgId}/members/{memberId}"].get;
    expect(getOp.parameters).toHaveLength(2);
    expect(getOp.parameters[0].name).toBe("orgId");
    expect(getOp.parameters[1].name).toBe("memberId");
  });

  it("passes deprecated flag and tags through", () => {
    const routes: InternalRoute[] = [
      {
        method: "DELETE",
        path: "/legacy-endpoint",
        handlers: ["deleteLegacy"],
        middleware: [],
        deprecated: true,
        tags: ["legacy"],
      },
    ];

    const openApi = toOpenApi(routes);
    const deleteOp = openApi.paths["/legacy-endpoint"].delete;
    expect(deleteOp.deprecated).toBe(true);
    expect(deleteOp.tags).toEqual(["legacy"]);
  });
});
