import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import type { Express, Request, Response, NextFunction } from "express";
import { scanRoutes } from "@routeui/core";

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
    const reqFunc = createRequire(import.meta.url);
    const uiPath = reqFunc.resolve("@routeui/ui");
    uiHtml = fs.readFileSync(uiPath, "utf-8");
  } catch {
    const possiblePaths = [
      path.resolve(process.cwd(), "node_modules/@routeui/ui/dist/index.html"),
      path.resolve(process.cwd(), "packages/ui/dist/index.html"),
      path.resolve(process.cwd(), "../../packages/ui/dist/index.html"),
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
    if (currentPath === "/routes" || currentPath === "/__routeui/routes") {
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(scanRoutes(app)));
    }

    // Serve HTML documentation interface
    if (req.method === "GET") {
      if (uiHtml) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(uiHtml);
      }
    }

    next();
  };
}
