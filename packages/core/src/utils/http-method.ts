import type { HttpMethod } from "../models/http-method.js";

export function toHttpMethod(method: string): HttpMethod {
  switch (method.toUpperCase()) {
    case "GET":
      return "GET";
    case "POST":
      return "POST";
    case "PUT":
      return "PUT";
    case "PATCH":
      return "PATCH";
    case "DELETE":
      return "DELETE";
    case "HEAD":
      return "HEAD";
    case "OPTIONS":
      return "OPTIONS";
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}
