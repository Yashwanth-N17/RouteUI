export interface InternalRoute {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  path: string;
  handlers: string[];
  middleware: string[];
  description?: string;
  tags?: string[];
  deprecated?: boolean;
}

/**
 * Replace Express-style path parameters like ":id" with actual values.
 * `params` is an object where keys correspond to param names without the leading colon.
 */
export function fillPathParams(path: string, params: Record<string, string>): string {
  return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    return encodeURIComponent(params[key] ?? `:${key}`);
  });
}
