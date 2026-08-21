<div align="center">

# RouteUI

### Runtime route detection with an interactive API explorer for Express.js

Build interactive API documentation directly from your Express application at runtime — inspired by FastAPI's `/docs`.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2022%2B-339933.svg)](https://nodejs.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/Yashwanth-N17/RouteUI/ci.yml?branch=main&label=CI)](https://github.com/Yashwanth-N17/RouteUI/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> 🚧 **Status:** Early Development (v0.1.0) — Core Engine & CLI Ready

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

- ⚡ **Zero Configuration** — Scan any existing Express app without modifying route definitions.
- 🔍 **Runtime Route Discovery** — Inspect internal Express router stacks directly at application runtime.
- 🌲 **Deep Nested Router Support** — Recursively traverses multi-level nested routers (`app.use('/api', router)`).
- 🏷️ **Route Parameter Detection** — Automatically extracts path variables (e.g. `/users/:userId/posts/:postId`).
- 🔀 **Multi-Path Array Support** — Handles array-based path definitions (e.g. `app.get(['/home', '/dashboard'], ...)`).
- 🛠️ **CLI Inspection Tool** — Command-line utility (`@routeui/cli`) to scan entry files and inspect endpoints.
- 🧩 **Middleware & Handler Tracking** — Inspects handler names and middleware attached to each route.
- 📦 **TypeScript & ESM Ready** — Built with TypeScript, shipping dual ESM and CommonJS exports.

---

## Packages Overview

This repository is managed as a **pnpm workspace monorepo**:

| Package                          | Version | Description                                                 |
| :------------------------------- | :------ | :---------------------------------------------------------- |
| [`@routeui/core`](packages/core) | `0.1.0` | Core runtime scanner and Express adapter engine             |
| [`@routeui/cli`](packages/cli)   | `0.1.0` | Command-line interface for route scanning and visualization |

---

## Quick Start

### 1. Programmatic Scanning (`@routeui/core`)

Install the core package in your project:

```bash
pnpm add @routeui/core express
# or
npm install @routeui/core express
```

Use `scanRoutes` to inspect your Express app:

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
  {
    method: 'GET',
    path: '/api/v1/health',
    handlers: [ '<anonymous>' ],
    middleware: []
  },
  {
    method: 'POST',
    path: '/api/v1/users',
    handlers: [ '<anonymous>' ],
    middleware: []
  }
]
*/
```

---

### 2. Command Line Interface (`@routeui/cli`)

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
│   ├── core/                # @routeui/core runtime scanner
│   └── cli/                 # @routeui/cli command line scanner
│
├── CONTRIBUTING.md          # Developer onboarding & guidelines
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
CLI Output      Interactive UI (Planned)
```

For a deep dive into the design decisions and Express router stack traversal, check out [docs/architecture.md](docs/architecture.md) and [docs/runtime-scanner.md](docs/runtime-scanner.md).

---

## Known Limitations

### Mounted Sub-applications

Routes registered on **mounted Express sub-applications** cannot be detected:

```js
const subApp = express()         // ← sub-application
subApp.get('/health', handler)
app.use('/api', subApp)          // ← RouteUI cannot see /api/health ❌
```

This is a JavaScript closure limitation. Express stores the sub-app inside a
closure when mounting it — that reference is not accessible as any property on
the layer at runtime.

**Workaround:** Use `express.Router()` instead. It works identically for route
grouping and is fully supported:

```js
const router = express.Router()  // ← use Router, not express()
router.get('/health', handler)
app.use('/api', router)          // ← RouteUI detects this ✅
```

`express.Router()` is the recommended Express pattern for grouping routes.
Sub-applications (`express()`) are intended for entirely separate Express
instances with different settings — a much rarer use case.

Instrumentation-based support for sub-apps is planned for **v0.2.0**.  
See [ADR 0005](docs/decisions/0005-mounted-subapp-limitation.md) for the full technical analysis.

---

## Roadmap

- [x] **Phase 1: Core Engine** — Express layer adapter, runtime scanner, route normalization.
- [x] **Phase 2: Router Capabilities** — Recursive nested router traversal, route parameters, multi-path arrays.
- [x] **Phase 3: CLI Tool** — CLI scanner (`@routeui/cli`), dynamic application loading, formatted tabular output.
- [x] **Phase 4: Documentation** — Installation guide, CLI reference, examples index, roadmap, contributing guide.
- [ ] **Phase 5: Interactive UI Explorer** — Embedded React documentation interface at `/docs`.
- [ ] **Phase 6: Schema & Exporters** — OpenAPI 3.1 exporter & Postman collection exporter.
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
