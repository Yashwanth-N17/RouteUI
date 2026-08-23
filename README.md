<div align="center">

# RouteUI

### Runtime route detection with an interactive API explorer for Express.js

Build interactive API documentation directly from your Express application at runtime — inspired by FastAPI's `/docs`.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933.svg)](https://nodejs.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/Yashwanth-N17/RouteUI/ci.yml?branch=main&label=CI)](https://github.com/Yashwanth-N17/RouteUI/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![npm @routeui/core](https://img.shields.io/npm/v/@routeui/core?label=%40routeui%2Fcore)](https://www.npmjs.com/package/@routeui/core)
[![npm @routeui/cli](https://img.shields.io/npm/v/@routeui/cli?label=%40routeui%2Fcli)](https://www.npmjs.com/package/@routeui/cli)
[![npm @routeui/express](https://img.shields.io/npm/v/@routeui/express?label=%40routeui%2Fexpress)](https://www.npmjs.com/package/@routeui/express)
[![npm @routeui/ui](https://img.shields.io/npm/v/@routeui/ui?label=%40routeui%2Fui)](https://www.npmjs.com/package/@routeui/ui)

> **Status:** v0.1.0 — First public release. All four packages are published and ready to use.

</div>

---

## Why RouteUI?

Express is the most widely used web framework for Node.js, but building and maintaining API documentation usually requires:

- Writing long OpenAPI (Swagger) specifications manually
- Decorating controllers with proprietary decorators
- Keeping YAML/JSON spec files in sync with evolving codebases
- Setting up complex build-time code generators

RouteUI eliminates this friction by **discovering routes directly from your Express application at runtime** and presenting them in clean structured formats or interactive tools.

---

## Features

- **Zero Configuration** — Scan any existing Express app without modifying route definitions.
- **Runtime Route Discovery** — Inspects internal Express router stacks directly at application runtime.
- **Interactive Documentation UI** — Mount a full API explorer at any path: `app.use('/docs', routeui(app))`.
- **Deep Nested Router Support** — Recursively traverses multi-level nested routers.
- **Route Parameter Detection** — Automatically extracts path variables (e.g. `/users/:userId/posts/:postId`).
- **Multi-Path Array Support** — Handles array-based path definitions (e.g. `app.get(['/home', '/dashboard'], ...)`).
- **Bearer Token Authentication** — Pass tokens directly in the UI for authenticated endpoint testing.
- **OpenAPI 3.0 Export** — Download an OpenAPI spec from the UI with one click.
- **Dark and Light Theme** — Toggle between dark and light modes in the UI.
- **CLI Inspection Tool** — Command-line utility (`@routeui/cli`) to scan entry files and inspect endpoints.
- **Middleware and Handler Tracking** — Inspects handler names and middleware attached to each route.
- **Mounted Sub-Application Support** — Use `autoRegister(express)` or `registerSubApp(subApp)` to traverse child Express instances.
- **TypeScript and ESM Ready** — Built with TypeScript, shipping dual ESM and CommonJS exports.
- **Production Safe by Default** — Middleware is automatically disabled when `NODE_ENV=production`.

---

## Packages Overview

This repository is managed as a **pnpm workspace monorepo**:

| Package                                    | Version | Description                                                         |
| :----------------------------------------- | :------ | :------------------------------------------------------------------ |
| [`@routeui/core`](packages/core)           | `0.1.0` | Core runtime scanner and Express adapter engine                     |
| [`@routeui/express`](packages/express)     | `0.1.0` | Express middleware — mounts the interactive docs UI in one line     |
| [`@routeui/ui`](packages/ui)               | `0.1.0` | React SPA bundle served by `@routeui/express`                       |
| [`@routeui/cli`](packages/cli)             | `0.1.0` | Command-line interface for route scanning and visualization         |

---

## Quick Start

### 1. Interactive Docs Middleware (`@routeui/express`)

This is the primary way to use RouteUI. Install and mount in one line:

```bash
pnpm add @routeui/express
# or
npm install @routeui/express
```

```ts
import express from 'express';
import { routeui } from '@routeui/express';

const app = express();

app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.json({ status: 'created' }));

// Mount the interactive docs UI
app.use('/docs', routeui(app));

app.listen(3000);
// Visit http://localhost:3000/docs
```

> **Note:** The middleware is automatically disabled when `NODE_ENV=production`. Pass `{ enabled: true }` to override behind authentication middleware.

---

### 2. Programmatic Scanning (`@routeui/core`)

```bash
pnpm add @routeui/core express
# or
npm install @routeui/core express
```

```typescript
import express from "express";
import { scanRoutes } from "@routeui/core";

const app = express();

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/v1/users", (req, res) => {
  res.json({ message: "User created" });
});

// Discover all registered routes
const routes = scanRoutes(app);
console.log(routes);
/*
[
  { method: 'GET',  path: '/api/v1/health', handlers: ['<anonymous>'], middleware: [] },
  { method: 'POST', path: '/api/v1/users',  handlers: ['<anonymous>'], middleware: [] }
]
*/
```

---

### 3. Command Line Interface (`@routeui/cli`)

Run the CLI tool directly using `npx` or `pnpm dlx`:

```bash
npx @routeui/cli scan ./app.js
```

**Output Example:**

```text
RouteUI
────────────────────────────────────────

✓ Scanned 2 routes

METHOD    PATH                          HANDLER             MIDDLEWARE
------    ----                          -------             ----------
GET       /api/v1/health                <anonymous>         -
POST      /api/v1/users                 <anonymous>         -
```

Read the full [CLI Usage Guide](docs/cli.md) for more details.

---

## Examples

We provide 6 runnable examples in the [`examples/`](examples) directory demonstrating different Express routing setups:

- [`examples/basic`](examples/basic): Single router with standard GET/POST endpoints.
- [`examples/nested`](examples/nested): Multi-level nested routers (`/api/v1/...`).
- [`examples/middleware`](examples/middleware): Route-level and router-level middleware execution stack.
- [`examples/params`](examples/params): Path parameters detection (`/users/:userId/posts/:postId`).
- [`examples/arrays`](examples/arrays): Multi-path array route definitions (`['/home', '/dashboard']`).
- [`examples/multiple-routers`](examples/multiple-routers): Multiple independent routers mounted under distinct paths.

To run an example locally:

```bash
pnpm --filter basic-example start
# or
node examples/basic/index.js
```

See the complete [Examples Guide](docs/examples.md) for details.

---

## Repository Structure

```text
RouteUI/
├── docs/
│   ├── architecture.md      # System architecture & adapter pattern
│   ├── installation.md      # Detailed installation & setup guide
│   ├── cli.md               # CLI command-line reference
│   ├── examples.md          # Example applications guide
│   ├── roadmap.md           # Development roadmap & status
│   └── project-structure.md # Monorepo directory structure
│
├── examples/                # Runnable demonstration projects
│   ├── basic/
│   ├── nested/
│   ├── middleware/
│   ├── params/
│   ├── arrays/
│   └── multiple-routers/
│
├── packages/
│   ├── core/                # @routeui/core  — runtime scanner
│   ├── express/             # @routeui/express — Express middleware
│   ├── ui/                  # @routeui/ui — React SPA bundle
│   └── cli/                 # @routeui/cli — CLI tool
│
├── CONTRIBUTING.md          # Developer onboarding & guidelines
├── SECURITY.md              # Security policy & responsible disclosure
├── README.md                # Project overview
└── pnpm-workspace.yaml      # Monorepo configuration
```

---

## Architecture

RouteUI uses a decoupled adapter architecture to isolate framework-specific internals from the core scanning logic:

```text
Express Application
        │
        ▼
Express Adapter Layer
        │
        ▼
Runtime Route Scanner
        │
        ▼
InternalRoute[] Model
        │
  ┌─────┴────────────────┐
  ▼                      ▼
CLI Output       Interactive UI (/docs)
```

For a deep dive into the design decisions and Express router stack traversal, check out [docs/architecture.md](docs/architecture.md) and [docs/runtime-scanner.md](docs/runtime-scanner.md).

---

## Sub-Application Support

Routes registered on **mounted Express sub-applications** require one extra setup call:

```ts
import express from 'express';
import { autoRegister, scanRoutes } from '@routeui/core';

// Call once before creating any sub-apps
autoRegister(express);

const app = express();
const subApp = express();

subApp.get('/health', (req, res) => res.send('OK'));
app.use('/api', subApp);

// RouteUI now detects GET /api/health
const routes = scanRoutes(app);
```

Alternatively, use `registerSubApp(subApp)` per sub-application. See [ADR 0005](docs/decisions/0005-mounted-subapp-limitation.md) for the full technical details.

If you do not call either helper, un-registered sub-apps are gracefully skipped without error. Standard `express.Router()` instances are always detected automatically and require no extra setup.

---

## Roadmap

- [x] **Phase 1: Core Engine** — Express layer adapter, runtime scanner, route normalization.
- [x] **Phase 2: Router Capabilities** — Recursive nested router traversal, route parameters, multi-path arrays.
- [x] **Phase 3: CLI Tool** — CLI scanner (`@routeui/cli`), dynamic application loading, formatted tabular output.
- [x] **Phase 4: Documentation** — Installation guide, CLI reference, examples index, roadmap, contributing guide.
- [x] **Phase 5: Interactive UI Explorer** — Embedded React documentation interface, request builder, dark mode, bearer auth, cURL export.
- [x] **Phase 6: Schema & Exporters** — OpenAPI 3.0 export from the interactive UI.
- [ ] **Phase 7: Multi-Framework Adapters** — Fastify & Hono support.

View the full [Roadmap Document](docs/roadmap.md).

---

## Development & Contributing

Contributions are welcome! Please review our [Contributing Guide](CONTRIBUTING.md) before submitting pull requests.

### Local Development Commands

```bash
# Install dependencies
pnpm install

# Build all workspace packages
pnpm build

# Run unit tests across packages
pnpm test

# Run tests in watch mode
pnpm test:watch

# Format codebase
pnpm format
```

---

## License

This project is licensed under the [MIT License](LICENSE).

<div align="center">

**RouteUI** — Bringing first-class runtime API documentation to Node.js.

</div>
