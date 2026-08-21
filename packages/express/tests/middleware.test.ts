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
});
