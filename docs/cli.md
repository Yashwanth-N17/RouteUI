# CLI Usage Guide (`@routeui/cli`)

The RouteUI CLI (`@routeui/cli`) is a command-line tool designed to inspect Express applications, scan registered routes at runtime, and display clean tabular endpoint documentation directly in your terminal.

---

## Installation

You can run `@routeui/cli` on demand via `npx`, or install it as a development dependency.

### Using `npx` (No Installation Required)

```bash
npx @routeui/cli scan ./server.js
```

### Local Project Installation

```bash
# Using pnpm
pnpm add -D @routeui/cli

# Using npm
npm install --save-dev @routeui/cli

# Using yarn
yarn add -D @routeui/cli
```

Once installed locally, you can run `routeui` or add it to your `package.json` scripts:

```json
{
  "scripts": {
    "routes": "routeui scan ./src/app.ts"
  }
}
```

---

## Command Reference

### `routeui scan <entry-file>`

Scans the specified entry file, dynamically imports the exported Express application, and prints formatted route information.

#### Syntax

```bash
routeui scan <entry-file>
```

#### Arguments

- `<entry-file>` _(required)_: Relative or absolute path to the entry file exporting your Express `app`.

#### Options & Flags

- `-h`, `--help`: Output usage details and CLI help message.
- `-v`, `--version`: Output the current version of `@routeui/cli`.

---

## Express Export Requirements

For `routeui scan` to load your application, the target file must export the Express `app` instance using standard default exports.

### ES Modules Example (`app.js` or `app.ts`)

```typescript
import express from "express";

const app = express();

app.get("/api/v1/users", (req, res) => res.json([]));
app.post("/api/v1/users", (req, res) => res.json({ status: "created" }));

export default app;
```

### CommonJS Example (`app.js`)

```javascript
const express = require("express");

const app = express();

app.get("/api/v1/users", (req, res) => res.json([]));
app.post("/api/v1/users", (req, res) => res.json({ status: "created" }));

module.exports = app;
```

---

## Output Format

Running `routeui scan` formats discovered routes into an organized console table:

```bash
routeui scan ./examples/basic/index.js
```

**Terminal Output:**

```text
RouteUI
────────────────────────────────────────

✓ Scanned 4 routes

METHOD    PATH                          HANDLER             MIDDLEWARE
------    ----                          -------             ----------
GET       /                             anonymous           -
GET       /users                        anonymous           -
POST      /users                        anonymous           -
GET       /users/:id                    anonymous           -
```

### Output Columns Explained

| Column         | Description                                                                                                                          |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| **METHOD**     | Normalized HTTP method (e.g. `GET`, `POST`, `PUT`, `DELETE`).                                                                        |
| **PATH**       | Full resolved route URL path, including prefix paths from nested routers and path parameter placeholders (e.g. `/api/v1/users/:id`). |
| **HANDLER**    | Named function name of the final route handler (or `anonymous` if unnamed).                                                          |
| **MIDDLEWARE** | Names of attached middleware functions applied to the route (or `-` if none).                                                        |

---

## Handling Dynamic Server Files

If your application file automatically starts listening on a port (e.g. `app.listen(3000)`), running `routeui scan` will import the file and scan the registered routes.

To decouple app creation from server startup, it is recommended practice to separate your app definition from `app.listen`:

- **`app.js`**: Defines routes and exports `app` (used by tests & RouteUI CLI).
- **`server.js`**: Imports `app` and calls `app.listen(port)`.

```bash
routeui scan ./app.js
```

---

## Usage in CI & Automation

You can incorporate `routeui scan` into your build or documentation verification pipeline to ensure no routes are accidentally dropped or broken.

Example GitHub Action step:

```yaml
- name: Verify Express Routes
  run: pnpm routeui scan ./dist/app.js
```

If the entry file cannot be found or fails to export a valid Express application, the CLI returns exit code `1` and prints a clear error message.

---

## Error Handling & Diagnostics

| Error Message                                       | Cause & Solution                                                                                |
| :-------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `Error: Missing entry file.`                        | No entry file path was provided. Specify a file path: `routeui scan ./app.js`.                  |
| `Error: Entry file not found at <path>`             | The file path does not exist. Check for typos or build artifacts.                               |
| `Error: Failed to import file <path>`               | Syntax error or missing module dependency inside entry file.                                    |
| `Error: No Express app exported from <path>`        | The file did not export an Express `app`. Use `export default app;` or `module.exports = app;`. |
| `No routes found. Did you forget to register them?` | The app has zero registered routes or routers.                                                  |
