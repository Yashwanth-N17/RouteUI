import type { Express } from "express";
import type { ExpressWithRouter } from "../types/express.js";
import { InternalRoute } from "../models/route.js";
import { toHttpMethod } from "../utils/http-method.js";
import { ExpressLayer } from "../types/layer.js";
import { lookupSubApp } from "./registry.js";

export function getExpressRoutes(app: Express): InternalRoute[] {
  const expressApp = app as unknown as ExpressWithRouter;

  if (!expressApp._router) {
    return [];
  }

  return scanLayers(expressApp._router.stack, "");
}

function scanLayers(stack: ExpressLayer[], basePath: string): InternalRoute[] {
  const routes: InternalRoute[] = [];

  for (const layer of stack) {
    if (!layer.route) {
      if (layer.name === "mounted_app") {
        const subApp = layer.handle ? lookupSubApp(layer.handle as Function) : undefined;
        if (subApp?._router?.stack && layer.regexp) {
          const mountPath = extractMountPath(layer.regexp);
          routes.push(...scanLayers(subApp._router.stack as ExpressLayer[], basePath + mountPath));
        }
        continue;
      }

      if (layer.handle?.stack && layer.regexp) {
        // Nested express.Router()
        const mountPath = extractMountPath(layer.regexp);
        routes.push(...scanLayers(layer.handle.stack, basePath + mountPath));
      }

      continue;
    }
    const paths = Array.isArray(layer.route.path) ? layer.route.path : [layer.route.path];

    const methods = Object.keys(layer.route.methods);

    for (const path of paths) {
      for (const method of methods) {
        const matchingLayers = layer.route.stack.filter(
          (rLayer) => !rLayer.method || rLayer.method.toLowerCase() === method.toLowerCase()
        );
        const names = matchingLayers.map((l) => l.name || "<anonymous>");
        const handlers = names.slice(-1);
        const middleware = names.length > 1 ? names.slice(0, -1) : [];

        let combinedPath = basePath;
        if (path === "*") {
          combinedPath = basePath ? `${basePath}/*` : "*";
        } else {
          const normPath = path.startsWith("/") ? path : `/${path}`;
          combinedPath = `${basePath}${normPath}`.replace(/\/+/g, "/");
          if (combinedPath.length > 1 && combinedPath.endsWith("/")) {
            combinedPath = combinedPath.slice(0, -1);
          }
        }

        routes.push({
          method: toHttpMethod(method),
          path: combinedPath || "/",
          handlers,
          middleware,
        });
      }
    }
  }
  return routes;
}

function extractMountPath(regexp: RegExp): string {
  let source = regexp.source;

  // Express fast_slash or root mount regex: /^\/?(?=\/|$)/i or /^\/$/
  if (source === "^\\/?(?=\\/|$)" || source === "^\\/$") {
    return "";
  }

  source = source
    .replace(/^\^\\?\/?/, "/")
    .replace(/\\\/\?\(\?=\\\/\|\$\)$/, "")
    .replace(/\\\/\?\(\?=\\\/\|\$\)/g, "")
    .replace(/\\\//g, "/")
    .replace(/\?\(\?=\/\|\$\)/g, "");

  if (source === "/" || source === "") {
    return "";
  }

  return source.startsWith("/") ? source : `/${source}`;
}
