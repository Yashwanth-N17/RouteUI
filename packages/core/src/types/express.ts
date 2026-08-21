import type { Express } from "express";
import type { ExpressLayer } from "./layer.js";

export interface ExpressWithRouter extends Omit<Express, "router"> {
  _router: {
    stack: ExpressLayer[];
  };
}
