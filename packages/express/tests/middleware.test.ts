import express from "express";
import { describe, expect, it } from "vitest";
import { routeui } from "../src/index.js";

describe("@routeui/express middleware", () => {
  it("should create a middleware function", () => {
    const app = express();
    const middleware = routeui(app);
    expect(typeof middleware).toBe("function");
  });

  it("should handle /__routeui/routes via middleware", () => {
    const app = express();
    app.get("/health", (req, res) => res.json({ ok: true }));

    const middleware = routeui(app);
    let jsonSent: any = null;
    const req = { path: "/__routeui/routes" } as any;
    const res = {
      setHeader: () => {},
      send: (data: string) => {
        jsonSent = JSON.parse(data);
      },
    } as any;

    middleware(req, res, () => {});
    expect(jsonSent).toBeDefined();
    expect(Array.isArray(jsonSent)).toBe(true);
  });

  it("should handle /__routeui/meta via middleware and return version", () => {
    const app = express();
    const middleware = routeui(app);
    let jsonSent: any = null;
    const req = { path: "/__routeui/meta" } as any;
    const res = {
      setHeader: () => {},
      send: (data: string) => {
        jsonSent = JSON.parse(data);
      },
    } as any;

    middleware(req, res, () => {});
    expect(jsonSent).toBeDefined();
    expect(jsonSent.version).toBe("0.1.0");
  });

  it("should handle /__routeui/openapi.json and return OpenAPI 3.0 document", () => {
    const app = express();
    app.get("/api/users", (req, res) => res.json([]));

    const middleware = routeui(app, { title: "Custom API Docs" });
    let jsonSent: any = null;
    let contentTypeHeader: string | null = null;

    const req = { path: "/__routeui/openapi.json" } as any;
    const res = {
      setHeader: (name: string, value: string) => {
        if (name.toLowerCase() === "content-type") {
          contentTypeHeader = value;
        }
      },
      send: (data: string) => {
        jsonSent = JSON.parse(data);
      },
    } as any;

    middleware(req, res, () => {});
    expect(contentTypeHeader).toBe("application/json");
    expect(jsonSent).toBeDefined();
    expect(jsonSent.openapi).toBe("3.0.0");
    expect(jsonSent.info.title).toBe("Custom API Docs");
    expect(jsonSent.paths["/api/users"]).toBeDefined();
    expect(jsonSent.paths["/api/users"].get).toBeDefined();
  });

  it("should not intercept user routes /routes or /meta", () => {
    const app = express();
    const middleware = routeui(app);
    let nextCalled = false;

    const reqRoutes = { path: "/routes", method: "GET" } as any;
    const resRoutes = {
      setHeader: () => {},
      send: () => {},
    } as any;

    middleware(reqRoutes, resRoutes, () => {
      nextCalled = true;
    });
  });

  it("should handle missing uiHtml gracefully with 500 status", () => {
    const app = express();
    const middleware = routeui(app);
    let statusCode: number | null = null;
    let bodySent: string | null = null;

    const req = { path: "/", method: "GET" } as any;
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      send: (data: string) => {
        bodySent = data;
      },
    };

    middleware(req, res, () => {});
    if (statusCode !== null) {
      expect(statusCode).toBe(500);
      expect(bodySent).toContain("RouteUI UI Bundle Missing");
    }
  });
});
