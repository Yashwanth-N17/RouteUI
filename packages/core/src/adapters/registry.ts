const subAppRegistry = new WeakMap<Function, { _router?: { stack: any[] } }>();
const patched = Symbol("routeui_patched");

// Manually register a single sub-app
export function registerSubApp(
  app: { _router?: { stack: any[] }; on: Function }
): void {
  app.on('mount', (parentApp: any) => {
    const stack = parentApp._router?.stack;
    if (stack) {
      const layer = stack[stack.length - 1];
      if (layer?.name === "mounted_app") {
        subAppRegistry.set(layer.handle, app);
      }
    }
  });
}

/**
 * Automatically register all sub-apps by patching `express.application.use`.
 *
 * @warning This mutates `expressModule.application.use` — the prototype shared by
 * every Express application in the same Node.js process. If multiple Express apps
 * coexist in the same process (e.g. in tests or a multi-tenant setup), the patch
 * applies to all of them. The Symbol guard prevents double-patching but does not
 * scope the behaviour per-app.
 */
export function autoRegister(expressModule: any): void {
  if (!expressModule?.application?.use || (expressModule as any)[patched]) {
    return;
  }
  (expressModule as any)[patched] = true;

  const originalUse = expressModule.application.use;
  expressModule.application.use = function(this: any, ...args: any[]) {
    const result = originalUse.apply(this, args);
    const stack = this._router?.stack;
    if (stack) {
      const layer = stack[stack.length - 1];
      if (layer?.name === "mounted_app") {
        const subAppArg = args.find((a: any) => typeof a === "function" && "_router" in a && "handle" in a);
        if (subAppArg) {
          subAppRegistry.set(layer.handle, subAppArg);
        }
      }
    }
    return result;
  };
}

export function lookupSubApp(
  handle: Function
): { _router?: { stack: any[] } } | undefined {
  return subAppRegistry.get(handle);
}
