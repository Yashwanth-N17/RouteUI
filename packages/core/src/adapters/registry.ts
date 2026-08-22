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

// Automatically register all sub-apps globally by patching Express
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
