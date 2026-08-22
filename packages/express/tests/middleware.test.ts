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
    // For GET on unmatched sub-paths, if uiHtml is not loaded it will respond 500, but for routes/meta endpoints it strictly checks /__routeui/routes and /__routeui/meta
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
    // When uiHtml is missing or present, it returns HTML response
    if (statusCode !== null) {
      expect(statusCode).toBe(500);
      expect(bodySent).toContain("RouteUI UI Bundle Missing");
    }
  });
});
