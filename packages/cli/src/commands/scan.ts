import { scanRoutes } from "@routeui/core";
import { loadApp } from "../utils/load-app.js";
import { formatRoutes } from "../format/routes.js";

export async function scanCommand(args: string[]) {
  const isJson = args.includes("--json");
  const entryFile = args.find((a) => !a.startsWith("-"));

  if (!entryFile) {
    console.error("Error: Missing entry file.");
    process.exit(1);
  }

  try {
    const app = await loadApp(entryFile);

    const routes = scanRoutes(app);

    if (!routes || routes.length === 0) {
      if (!isJson) console.log("No routes found. Did you forget to register them?");
      return;
    }

    if (isJson) {
      console.log(JSON.stringify(routes, null, 2));
    } else {
      formatRoutes(routes);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred.");
    }

    process.exit(1);
  }
}
