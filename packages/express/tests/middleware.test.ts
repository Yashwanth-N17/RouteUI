import express from "express";
import { describe, expect, it } from "vitest";
import { routeui } from "../src/index.js";

describe("@routeui/express middleware", () => {
  it("should create a middleware function", () => {
    const app = express();
    const middleware = routeui(app);
    expect(typeof middleware).toBe("function");
  });

  it("should automatically register /__routeui/routes endpoint on express app", () => {
    const app = express();
    app.get("/health", (req, res) => res.json({ ok: true }));

    // Mount middleware
    app.use("/docs", routeui(app));

    const stack = (app as any)._router.stack;
    const hasMetadataRoute = stack.some(
      (layer: any) => layer.route?.path === "/__routeui/routes"
    );

    expect(hasMetadataRoute).toBe(true);
  });
});
