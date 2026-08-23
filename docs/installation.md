# Installation & Setup Guide

This guide covers installing and integrating **RouteUI** into your Node.js and Express applications.

---

## System Requirements

Before installing RouteUI, ensure your environment meets the following requirements:

| Component                 | Required Version                              | Recommended Version |
| :------------------------ | :-------------------------------------------- | :------------------ |
| **Node.js**               | `>= 18.0.0`                                   | `22.x LTS`          |
| **Express.js**            | `>= 4.17.0` or `5.x`                          | `4.21.x`            |
| **Package Manager**       | `pnpm >= 8.0` / `npm >= 9.0` / `yarn >= 1.22` | `pnpm 9.x`          |
| **TypeScript** (Optional) | `>= 4.8`                                      | `5.x`               |

---

## Installing Workspace Packages

RouteUI is modularized into four packages:

### 1. `@routeui/core`

The core runtime scanner and Express adapter. Required for programmatic route inspection.

```bash
# Using pnpm (recommended)
pnpm add @routeui/core

# Using npm
npm install @routeui/core

# Using yarn
yarn add @routeui/core
```

### 2. `@routeui/express`

Express middleware that mounts the interactive documentation UI in one line. This is the primary package for most users.

```bash
# Using pnpm
pnpm add @routeui/express

# Using npm
npm install @routeui/express

# Using yarn
yarn add @routeui/express
```

Usage:

```ts
import express from 'express';
import { routeui } from '@routeui/express';

const app = express();

app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.json({ status: 'created' }));

// Mount the interactive docs UI at /docs
app.use('/docs', routeui(app));

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
// Visit http://localhost:3000/docs
```

### 3. `@routeui/ui`

The React SPA bundle. This package is bundled automatically by `@routeui/express` and does not usually need to be installed directly.

```bash
pnpm add @routeui/ui
```

### 4. `@routeui/cli`

The command-line tool used to scan Express entry files and format endpoint output in the terminal.

```bash
# Using pnpm
pnpm add -D @routeui/cli

# Using npm
npm install --save-dev @routeui/cli

# Using yarn
yarn add -D @routeui/cli
```

> **Note:** You can also run `@routeui/cli` directly using `npx @routeui/cli scan <entry-file>` without adding it to `package.json`.

---

## TypeScript Setup

`@routeui/core` is written in TypeScript and provides built-in type declarations out of the box. No separate `@types/routeui` package is required.

Make sure your `tsconfig.json` includes appropriate module resolution settings for modern Node.js:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

Ensure Express type definitions are installed if you are developing in TypeScript:

```bash
pnpm add -D @types/express @types/node
```

---

## ESM & CommonJS Compatibility

RouteUI packages ship with dual module formats:

- **ESM** (`.js` using ES modules `import` / `export`)
- **CommonJS** (`.cjs` using `require()` / `module.exports`)

### ES Modules Example (`import`)

```typescript
import express from "express";
import { scanRoutes } from "@routeui/core";

const app = express();
app.get("/status", (req, res) => res.json({ ok: true }));

const routes = scanRoutes(app);
console.log(routes);
```

### CommonJS Example (`require`)

```javascript
const express = require("express");
const { scanRoutes } = require("@routeui/core");

const app = express();
app.get("/status", (req, res) => res.json({ ok: true }));

const routes = scanRoutes(app);
console.log(routes);
```

---

## Monorepo & Local Development Setup

If you are contributing to RouteUI or building locally inside a monorepo workspace:

1. Clone the repository:

   ```bash
   git clone https://github.com/Yashwanth-N17/RouteUI.git
   cd RouteUI
   ```

2. Install all workspace dependencies:

   ```bash
   pnpm install
   ```

3. Build all workspace packages:

   ```bash
   pnpm build
   ```

4. Link packages within the workspace:
   Workspace packages reference each other via `workspace:*` specifiers defined in `pnpm-workspace.yaml`.

---

## Troubleshooting & Common Issues

### 1. `Cannot find module '@routeui/core'`

- Ensure you have run `pnpm build` if working in the monorepo repository.
- Verify `node_modules` is populated by running `pnpm install`.

### 2. `Error: No Express app exported from entry-file`

When using `@routeui/cli scan <entry-file>`, the target file must export the Express application instance:

- **ESM:** `export default app;`
- **CommonJS:** `module.exports = app;`

### 3. `Router layers not detected`

- Ensure routes are registered on the Express `app` or `router` **before** calling `scanRoutes(app)`.
- If routes are registered dynamically after app startup listening, call `scanRoutes(app)` after registration completes.

---

## Next Steps

- Explore the [CLI Usage Guide](cli.md) to inspect endpoints from your terminal.
- Check out the [Examples Guide](examples.md) to see RouteUI scanning in various Express setups.
- Read about the internal architecture in [architecture.md](architecture.md).
