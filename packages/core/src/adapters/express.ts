import type { Express } from "express";
import type { ExpressWithRouter } from "../types/express.js";
import { InternalRoute } from "../models/route.js";
import { toHttpMethod } from "../utils/http-method.js";
import { ExpressLayer } from "../types/layer.js";
import { lookupSubApp } from "./registry.js";

export function getExpressRoutes(app: Express): InternalRoute[] {
  const expressApp = app as unknown as ExpressWithRouter;

  const stack =
    expressApp._router?.stack ||
    (expressApp as any).router?.stack ||
    (expressApp as any).stack;

  if (!stack || !Array.isArray(stack)) {
    return [];
  }

  return scanLayers(stack, "");
}

function scanLayers(stack: ExpressLayer[], basePath: string): InternalRoute[] {
  const routes: InternalRoute[] = [];

  for (const layer of stack) {
    if (!layer) continue;

    if (layer.name === "mounted_app") {
      const subApp = lookupSubApp(layer.handle as Function);
      const appStack = subApp?._router?.stack;
      if (appStack && Array.isArray(appStack)) {
        const mountPath = extractMountPath(layer);
        routes.push(...scanLayers(appStack as ExpressLayer[], basePath + mountPath));
      }
      continue;
    }

    const subStack =
      layer.handle?.stack ||
      (layer.handle as any)?._router?.stack ||
      (layer.handle as any)?.router?.stack;

    if (subStack && Array.isArray(subStack)) {
      const mountPath = extractMountPath(layer);
      routes.push(...scanLayers(subStack as ExpressLayer[], basePath + mountPath));
      continue;
    }

    if (!layer.route || !Array.isArray(layer.route.stack)) {
      continue;
    }
    const paths = Array.isArray(layer.route.path) ? layer.route.path : [layer.route.path];

    const methods = layer.route.methods ? Object.keys(layer.route.methods) : [];

    for (const path of paths) {
      if (typeof path !== "string" && typeof path !== "object") continue;
      for (const method of methods) {
        const matchingLayers = (layer.route.stack || []).filter(
          (rLayer) => rLayer && (!rLayer.method || rLayer.method.toLowerCase() === method.toLowerCase())
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

function extractMountPath(layer: ExpressLayer): string {
  if (layer.path) {
    if (Array.isArray(layer.path)) return (layer.path[0] as string) || "";
    if (typeof layer.path === "string") return layer.path;
  }

  if (!layer.regexp) return "";
  let source = layer.regexp.source;

  // Express fast_slash or root mount regex: /^\/?(?=\/|$)/i or /^\/$/
  if (source === "^\\/?(?=\\/|$)" || source === "^\\/$" || source === "^\\/?$") {
    return "";
  }

  // Handle parameter keys in layer.keys (e.g. :id)
  if (layer.keys && Array.isArray(layer.keys) && layer.keys.length > 0) {
    let keyIdx = 0;
    source = source.replace(/\(\?:([^\)]+)\)/g, () => {
      const key = layer.keys?.[keyIdx++];
      return key ? `:${key.name}` : "";
    });
  }

  source = source
    .replace(/^\^/, "")
    .replace(/\$\/?$/, "")
    .replace(/\\\/\?\(\?=\\\/\|\$\)$/, "")
    .replace(/\(\?=\\\/\|\$\)/g, "")
    .replace(/\(\?=\/\|\$\)/g, "")
    .replace(/\\\/\?/g, "")
    .replace(/\\\//g, "/")
    .replace(/\/+/g, "/");

  if (!source.startsWith("/")) {
    source = `/${source}`;
  }

  if (source.length > 1 && source.endsWith("/")) {
    source = source.slice(0, -1);
  }

  return source === "/" ? "" : source;
}
