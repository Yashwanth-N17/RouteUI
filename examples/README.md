# RouteUI Examples

This directory contains standalone, runnable demonstration applications showcasing RouteUI scanning capabilities across common Express routing patterns.

---

## Available Examples

| Directory                               | Feature Demonstrated                    | Run Command                                    |
| :-------------------------------------- | :-------------------------------------- | :--------------------------------------------- |
| [`basic/`](basic)                       | Direct Express route definitions        | `pnpm --filter basic-example start`            |
| [`nested/`](nested)                     | Deeply nested routers (`/api/v1/admin`) | `pnpm --filter nested-example start`           |
| [`middleware/`](middleware)             | Inline middleware tracking              | `pnpm --filter middleware-example start`       |
| [`params/`](params)                     | Route parameters & wildcards            | `pnpm --filter params-example start`           |
| [`arrays/`](arrays)                     | Multi-path array route aliases          | `pnpm --filter arrays-example start`           |
| [`multiple-routers/`](multiple-routers) | Multiple independent mounted routers    | `pnpm --filter multiple-routers-example start` |

---

## Quick Start

Run any example using `pnpm`:

```bash
# Run basic example
pnpm --filter basic-example start

# Or directly with node:
node examples/basic/index.js
```

Or scan any example using the RouteUI CLI:

```bash
pnpm routeui scan ./examples/basic/index.js
```

For full details, view the [Examples Guide](../docs/examples.md).
