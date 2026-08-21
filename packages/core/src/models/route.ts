import { HttpMethod } from "./http-method.js";

export interface InternalRoute {
  method: HttpMethod;
  path: string;
  handlers: string[];
  middleware: string[];
  description?: string;
  tags?: string[];
  deprecated?: boolean;
}
