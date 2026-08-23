# RouteUI Roadmap

This document tracks the active development roadmap for RouteUI.

The roadmap is divided into milestones based on feature capabilities rather than calendar dates.

---

# Current Milestone Status

```text
Phase 1 — Core Engine                Completed
Phase 2 — Router Capabilities        Completed
Phase 3 — CLI Inspection Tool        Completed
Phase 4 — Documentation              Completed
Phase 5 — Interactive UI Explorer    Completed
Phase 6 — Schema & Exporters         Completed (OpenAPI 3.0)
Phase 7 — Multi-Framework Adapters   Planned
Phase 8 — Ecosystem & Extensions     Future
```

---

# Detailed Milestones

## Milestone 1 — Core Runtime Scanner Engine

**Status:** ✅ Completed

### Features

- [x] Monorepo foundation setup (pnpm workspaces)
- [x] TypeScript compiler and module configuration (`tsconfig.json`)
- [x] `tsup` build pipeline (Dual ESM + CommonJS outputs, `.d.ts` generation)
- [x] Framework adapter architecture (`ExpressAdapter`)
- [x] Runtime Express route scanner (`scanRoutes`)
- [x] `InternalRoute` data model definition
- [x] HTTP method normalization utility
- [x] Vitest unit testing framework setup
- [x] Initial unit test suite

---

## Milestone 2 — Advanced Router Capabilities

**Status:** ✅ Completed

### Features

- [x] Recursive router stack traversal algorithm
- [x] Deeply nested router detection (`app.use('/api', apiRouter.use('/v1', ...))`)
- [x] Multi-path array route detection (`app.get(['/health', '/status'], ...)`)
- [x] Route path parameter extraction (`/users/:userId/posts/:postId`)
- [x] Optional path parameters and wildcard route detection
- [x] Support for `app.route()` and `router.route()` chainable definitions
- [x] 6 comprehensive runnable example applications (`examples/`)
- [x] Unit test suite for scanner edge cases and example configurations

---

## Milestone 3 — Command-Line Interface (`@routeui/cli`)

**Status:** ✅ Completed

### Features

- [x] CLI package initialization (`@routeui/cli`)
- [x] Executable binary entry point (`routeui`)
- [x] Entry file route scanner command (`routeui scan <entry-file>`)
- [x] Dynamic module loading helper (`loadApp`) supporting ESM and CommonJS exports
- [x] Error handling for missing files, invalid exports, and un-scannable modules
- [x] Tabular terminal output renderer (`formatRoutes`) with method, path, handler, and middleware columns
- [x] Support for `--help` and `--version` flags

---

## Milestone 4 — Comprehensive Documentation

**Status:** ✅ Completed

### Features

- [x] Root [`README.md`](../README.md) overhaul highlighting features, installation, core usage, CLI, and architecture
- [x] Dedicated [`docs/installation.md`](installation.md) guide for pnpm/npm/yarn, TypeScript, ESM/CJS, and monorepo setups
- [x] Dedicated [`docs/cli.md`](cli.md) usage guide covering `routeui scan`, flags, export requirements, and CI automation
- [x] Dedicated [`docs/examples.md`](examples.md) guide detailing all 6 example apps, code snippets, and scan outputs
- [x] Package-level [`packages/cli/README.md`](../packages/cli/README.md) and [`examples/README.md`](../examples/README.md)
- [x] Updated [`CONTRIBUTING.md`](../CONTRIBUTING.md) developer onboarding guide

---

## Milestone 5 — Interactive UI Explorer

**Status:** Completed

### Features

- [x] Embedded React documentation single-page application (SPA)
- [x] Express middleware helper: `app.use('/docs', routeui(app))`
- [x] Interactive endpoint documentation interface
- [x] Endpoint request builder and interactive "Try it out" execution
- [x] Syntax-highlighted request and response body viewer
- [x] Full-text endpoint search, filter by HTTP method
- [x] Bearer token authentication in the UI
- [x] Dark and light visual theme toggle
- [x] Response time and status code display
- [x] cURL command export
- [x] Request history panel
- [x] Deprecation badge UI

---

## Milestone 6 — Schema Extraction & Exporters

**Status:** Completed (OpenAPI 3.0)

### Features

- [x] OpenAPI 3.0 specification export from the UI

### Planned

- Postman Collection v2.1 export
- JSON and Markdown static documentation exporters
- Request body schema inference from Express validation middleware
- Query and path parameter type metadata

---

## Milestone 7 — Multi-Framework Adapters

**Status:** Planned

### Goals

- Fastify adapter (`@routeui/fastify`)
- Hono adapter (`@routeui/hono`)
- Koa adapter (`@routeui/koa`)
- Abstract framework adapter interface to ensure scanner remains 100% framework-independent

---

## Milestone 8 — Ecosystem & Extensions

**Status:** Future

### Ideas

- Plugin architecture for custom documentation themes and tabs
- Authentication provider integration (Bearer token, API key, OAuth2 flow helpers in UI)
- VS Code Extension for inline route preview
- GitHub Action for automated API breaking change detection

---

# Feature Lifecycle

Every new feature in RouteUI moves through a systematic development cycle:

```text
Proposal / Issue
       │
       ▼
Architecture & Design Review
       │
       ▼
Failing Test Suite (TDD)
       │
       ▼
Implementation
       │
       ▼
Passing Unit & Integration Tests
       │
       ▼
Documentation Update
       │
       ▼
Merge & Package Release
```

---

# Definition of Done

A feature milestone is considered **Done** when:

1. Implementation passes all linting, building, and type checks (`pnpm build`).
2. Unit test coverage validates core paths and edge cases (`pnpm test`).
3. Documentation is updated across `docs/` and package `README` files.
4. CI workflows (`.github/workflows/ci.yml`) pass cleanly.
