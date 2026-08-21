# @routeui/ui

Frontend user interface component and standalone bundle for RouteUI interactive API documentation explorer.

## Overview

This package contains the React application built with Vite and Tailwind CSS that renders the interactive API explorer for RouteUI. It bundles into a single self-contained HTML file used by backend integrations (e.g. `@routeui/express`).

## Building

```bash
pnpm build
```

This builds the Vite application and runs `scripts/inline.cjs` to produce a single self-contained `dist/index.html` file.
