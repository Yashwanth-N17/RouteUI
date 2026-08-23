# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-23

This is the first public release of RouteUI.

### Added

**Core (`@routeui/core`)**
- Runtime Express route scanner (`scanRoutes`)
- Recursive router stack traversal for deeply nested routers
- Route parameter detection (`/users/:id`, optional params, wildcards)
- Array path route detection (`app.get(['/health', '/status'], ...)`)
- Middleware and handler name extraction
- Mounted sub-application support via `autoRegister(express)` and `registerSubApp(subApp)`
- Internal route model (`InternalRoute`) decoupled from Express internals
- HTTP method normalization utility
- OpenAPI 3.0 specification converter (`toOpenApi`)

**Express Middleware (`@routeui/express`)**
- `routeui(app)` middleware factory for mounting the interactive UI
- One-line setup: `app.use('/docs', routeui(app))`
- Production environment guard — disabled by default when `NODE_ENV=production`
- `enabled` option for explicit enable/disable control (e.g. behind authentication in production)
- Security headers on all documentation responses (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- Content-Security-Policy header (`default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:`) on UI HTML responses
- JSON metadata and OpenAPI endpoints (`/__routeui/routes`, `/__routeui/meta`, `/__routeui/openapi.json`)

**Interactive UI (`@routeui/ui`)**
- React single-page application bundled as a self-contained static HTML file for Express embedding
- Endpoint list with method badges and full-text search
- Filter routes by HTTP method
- Interactive request builder with bearer token authentication support
- Syntax-highlighted JSON response viewer with HTML-entity escaping (XSS-safe)
- Response time display and status code indicator
- Request history panel
- cURL command export
- OpenAPI 3.0 specification export
- Deprecation badge UI
- Dark and light theme toggle

**CLI (`@routeui/cli`)**
- `routeui scan <entry-file>` command for terminal route inspection
- Tabular output with METHOD, PATH, HANDLER, and MIDDLEWARE columns
- Dynamic module loading supporting ESM and CommonJS exports
- `--help` and `--version` flags
- Exit code `1` on scan failure for CI integration

**Documentation**
- Root README with installation guide, quick start, and package overview
- `docs/architecture.md` — system design and component responsibilities
- `docs/installation.md` — setup guide for pnpm, npm, yarn, TypeScript, ESM/CJS
- `docs/cli.md` — CLI usage, flags, export requirements, and CI integration
- `docs/examples.md` — guide for all 6 example applications
- `docs/roadmap.md` — milestone tracking
- `docs/runtime-scanner.md` — internal scanner design
- `docs/project-structure.md` — repository layout reference
- `docs/decisions/` — Architecture Decision Records (ADRs)
- `CONTRIBUTING.md` — developer onboarding guide
- `SECURITY.md` — security policy and responsible disclosure process
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1

**Infrastructure**
- pnpm workspace monorepo with 4 publishable packages
- tsup dual-format build (ESM + CommonJS with `.d.ts` declarations)
- 39 unit and integration tests via Vitest
- 6 standalone example applications
- GitHub Actions CI workflow

---

## Versioning Policy

- **MAJOR** — Breaking API changes
- **MINOR** — New backwards-compatible features
- **PATCH** — Bug fixes and improvements
