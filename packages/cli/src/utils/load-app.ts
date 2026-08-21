import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadApp(entryFile: string) {
  const absolutePath = path.resolve(process.cwd(), entryFile);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Error: Entry file not found at ${absolutePath}`);
  }

  let module;
  try {
    module = await import(pathToFileURL(absolutePath).href);
  } catch (error) {
    throw new Error(
      `Error: Failed to import file ${entryFile}.\nDetails: ${(error as Error).message}`
    );
  }

  // Support both CommonJS and ESM exports
  let app = module.default ?? module;

  if (app && app.default) {
    app = app.default;
  }

  // Detect invalid exports
  if (!app || typeof app !== "function" || typeof app.use !== "function") {
    throw new Error(
      `Error: No Express app exported from ${entryFile}.\nPlease export your app using 'module.exports = app;' or 'export default app;'`
    );
  }

  return app;
}
