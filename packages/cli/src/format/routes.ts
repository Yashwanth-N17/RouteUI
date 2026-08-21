export interface RouteInfo {
  method: string;
  path: string;
  handlers: string[];
  middleware: string[];
}

export function formatRoutes(routes: RouteInfo[]) {
  console.log();
  console.log("RouteUI");
  console.log("────────────────────────────────────────");
  console.log();

  console.log(`✓ Scanned ${routes.length} route${routes.length === 1 ? "" : "s"}`);
  console.log();

  const maxPathLen = Math.max(30, ...routes.map((r) => r.path.length + 4));
  const maxHandlerLen = Math.max(20, ...routes.map((r) => (r.handlers.length > 0 ? r.handlers.join(", ").length : 1) + 4));

  console.log("METHOD".padEnd(10) + "PATH".padEnd(maxPathLen) + "HANDLER".padEnd(maxHandlerLen) + "MIDDLEWARE");

  console.log("------".padEnd(10) + "----".padEnd(maxPathLen) + "-------".padEnd(maxHandlerLen) + "----------");

  for (const route of routes) {
    const handler = route.handlers.length > 0 ? route.handlers.join(", ") : "-";

    const middleware = route.middleware.length > 0 ? route.middleware.join(", ") : "-";

    console.log(route.method.padEnd(10) + route.path.padEnd(maxPathLen) + handler.padEnd(maxHandlerLen) + middleware);
  }

  console.log();
}
