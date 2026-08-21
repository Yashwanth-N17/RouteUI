const subAppRegistry = new WeakMap<Function, { _router?: { stack: any[] } }>();

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
  if (!expressModule || !expressModule.application || !expressModule.application.use) {
    return;
  }
  
  const originalUse = expressModule.application.use;
  expressModule.application.use = function(this: any, ...args: any[]) {
    const result = originalUse.apply(this, args);
    const stack = this._router?.stack;
    if (stack) {
      const layer = stack[stack.length - 1];
      if (layer?.name === "mounted_app") {
        const subAppArg = args.find((a: any) => typeof a === "function" && a.name === "app" && "handle" in a);
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
