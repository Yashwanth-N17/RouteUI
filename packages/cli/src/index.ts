#!/usr/bin/env node

import { createRequire } from "node:module";
import { scanCommand } from "./commands/scan.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const [, , command, ...args] = process.argv;

switch (command) {
  case "scan":
    await scanCommand(args);
    break;

  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;

  case "--version":
  case "-v":
    console.log(version);
    break;

  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}

function printHelp() {
  console.log(`
RouteUI CLI

Usage:
  routeui scan <entry-file>

Options:
  -h, --help       Show help
  -v, --version    Show version
`);
}
