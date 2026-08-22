import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import type { Express, Request, Response, NextFunction } from "express";
import { scanRoutes, toOpenApi } from "@routeui/core";

function getRequire() {
  try {
    if (typeof __filename !== "undefined" && __filename) {
      return createRequire(__filename);
    }
  } catch {}
  return createRequire(import.meta.url);
}

export interface RouteUIOptions {
  /**
   * Title displayed in the UI header.
   * @default "RouteUI Docs"
   */
  title?: string;
}

/**
 * RouteUI Express middleware to serve interactive API documentation UI and route metadata.
 * 
 * @example
 * ```js
 * const { routeui } = require("@routeui/express");
 * app.use("/docs", routeui(app));
 * ```
 */
export function routeui(app: Express, options?: RouteUIOptions) {
  let uiHtml = "";

  // Attempt to resolve static UI bundle from @routeui/ui
  try {
    const reqFunc = getRequire();
    const uiPath = reqFunc.resolve("@routeui/ui");
    uiHtml = fs.readFileSync(uiPath, "utf-8");
  } catch {
    const possiblePaths = [
      path.resolve(__dirname, "../../ui/dist/index.html"),
      path.resolve(__dirname, "../node_modules/@routeui/ui/dist/index.html"),
      path.resolve(process.cwd(), "node_modules/@routeui/ui/dist/index.html"),
      path.resolve(process.cwd(), "packages/ui/dist/index.html"),
      path.resolve(process.cwd(), "../../packages/ui/dist/index.html"),
      path.resolve(process.cwd(), "../../RouteUI/packages/ui/dist/index.html"),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        uiHtml = fs.readFileSync(p, "utf-8");
        break;
      }
    }
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const currentPath = req.path || req.url;

    // Handle metadata routes JSON request
    if (currentPath === "/__routeui/routes") {
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(scanRoutes(app)));
    }

    // Handle metadata info JSON request (version)
    if (currentPath === "/__routeui/meta") {
      res.setHeader("Content-Type", "application/json");
      let version = "0.1.0";
      try {
        const reqFunc = getRequire();
        const pkgPath = reqFunc.resolve("@routeui/express/package.json");
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg && pkg.version) version = pkg.version;
      } catch {
        try {
          const pkgPath = path.resolve(process.cwd(), "node_modules/@routeui/express/package.json");
          if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            if (pkg && pkg.version) version = pkg.version;
          }
        } catch {}
      }
      return res.send(JSON.stringify({ version }));
    }

    // Handle OpenAPI 3.0 JSON spec export
    if (currentPath === "/__routeui/openapi.json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", 'inline; filename="openapi.json"');
      const routes = scanRoutes(app);
      let version = "0.1.0";
      try {
        const reqFunc = getRequire();
        const pkgPath = reqFunc.resolve("@routeui/express/package.json");
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg && pkg.version) version = pkg.version;
      } catch {
        try {
          const pkgPath = path.resolve(process.cwd(), "node_modules/@routeui/express/package.json");
          if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            if (pkg && pkg.version) version = pkg.version;
          }
        } catch {}
      }
      const openApiDoc = toOpenApi(routes, {
        title: options?.title ?? "API Documentation",
        version,
      });
      return res.send(JSON.stringify(openApiDoc, null, 2));
    }

    // Serve HTML documentation interface
    if (req.method === "GET") {
      if (uiHtml) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(uiHtml);
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(500).send("<h1>500 - RouteUI UI Bundle Missing</h1><p>The RouteUI static UI bundle (@routeui/ui) could not be loaded. Please ensure @routeui/ui is built.</p>");
    }

    next();
  };
}
