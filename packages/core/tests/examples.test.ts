import { describe, expect, it } from "vitest";
import { scanRoutes } from "../src/index.js";

import basicApp from "../../../examples/basic/index.js";
import nestedApp from "../../../examples/nested/index.js";
import middlewareApp from "../../../examples/middleware/index.js";
import paramsApp from "../../../examples/params/index.js";
import arraysApp from "../../../examples/arrays/index.js";
import multipleRoutersApp from "../../../examples/multiple-routers/index.js";

describe("Example Applications Integration Tests", () => {
  it("should scan basic example app", () => {
    const routes = scanRoutes(basicApp);
    expect(routes).toEqual([
      { method: "GET", path: "/", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/health", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/users", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/users/profile", handlers: ["getUserProfile"], middleware: [] },
      { method: "POST", path: "/users", handlers: ["<anonymous>"], middleware: [] },
      { method: "PUT", path: "/users", handlers: ["<anonymous>"], middleware: [] },
      { method: "DELETE", path: "/users", handlers: ["<anonymous>"], middleware: [] },
    ]);
  });

  it("should scan nested example app", () => {
    const routes = scanRoutes(nestedApp);
    expect(routes).toEqual([
      { method: "GET", path: "/api/ping", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/api/v1/status", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/api/v1/admin/analytics", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/api/v1/admin/settings", handlers: ["<anonymous>"], middleware: [] },
    ]);
  });

  it("should scan middleware example app", () => {
    const routes = scanRoutes(middlewareApp);
    expect(routes).toEqual([
      { method: "GET", path: "/public", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/logged", handlers: ["<anonymous>"], middleware: ["logger"] },
      {
        method: "GET",
        path: "/protected",
        handlers: ["<anonymous>"],
        middleware: ["authenticate", "checkPermissions"],
      },
      {
        method: "POST",
        path: "/items",
        handlers: ["<anonymous>"],
        middleware: ["authenticate", "validatePayload"],
      },
    ]);
  });

  it("should scan params example app", () => {
    const routes = scanRoutes(paramsApp);
    expect(routes).toEqual([
      { method: "GET", path: "/users/:id", handlers: ["<anonymous>"], middleware: [] },
      {
        method: "GET",
        path: "/users/:userId/posts/:postId",
        handlers: ["<anonymous>"],
        middleware: [],
      },
      { method: "GET", path: "/reports/:year?", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/files/*", handlers: ["<anonymous>"], middleware: [] },
    ]);
  });

  it("should scan arrays example app", () => {
    const routes = scanRoutes(arraysApp);
    expect(routes).toEqual([
      { method: "GET", path: "/health", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/status", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/ping", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/v1/users", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/v2/users", handlers: ["<anonymous>"], middleware: [] },
      { method: "POST", path: "/login", handlers: ["<anonymous>"], middleware: [] },
      { method: "POST", path: "/signin", handlers: ["<anonymous>"], middleware: [] },
    ]);
  });

  it("should scan multiple routers example app", () => {
    const routes = scanRoutes(multipleRoutersApp);
    expect(routes).toEqual([
      { method: "POST", path: "/auth/login", handlers: ["<anonymous>"], middleware: [] },
      { method: "POST", path: "/auth/logout", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/users", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/users/me", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/products", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/products/search", handlers: ["<anonymous>"], middleware: [] },
      { method: "GET", path: "/orders", handlers: ["<anonymous>"], middleware: [] },
      { method: "POST", path: "/orders", handlers: ["<anonymous>"], middleware: [] },
    ]);
  });
});
