import type { Express } from "express";
import { getExpressRoutes } from "../adapters/express.js";
import { InternalRoute } from "../models/route.js";

export function scanRoutes(app: Express): InternalRoute[] {
  return getExpressRoutes(app).filter((r) => !r.path.startsWith("/__routeui"));
}
