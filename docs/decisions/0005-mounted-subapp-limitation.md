# ADR 0005 — Mounted Sub-Application Support via Instrumentation

**Date:** 2026-07-25 (Updated 2026-08-22)  
**Status:** Implemented & Shipping (v0.1.0)  
**Deciders:** RouteUI core team

---

## Context

A user request was raised to support route detection inside mounted Express
sub-applications — the pattern where a separate `express()` instance is passed
to `app.use()` as a child application:

```js
const subApp = express()
subApp.get('/health', handler)
app.use('/api', subApp)
// Expected: RouteUI detects GET /api/health
```

---

## Technical Challenge & Solution

In Express, when a sub-app is mounted via `app.use('/api', subApp)`, Express wraps the sub-app in an internal `mounted_app` handler closure. Direct inspection of `layer.handle` cannot reveal the underlying sub-app instance.

To solve this, RouteUI provides two instrumentation options in `@routeui/core`:

1. **`autoRegister(expressModule)`**: Patches `express.application.use` globally so any mounted sub-apps are recorded in a internal `WeakMap` registry as soon as `app.use('/prefix', subApp)` is invoked.
2. **`registerSubApp(subApp)`**: Uses Express's `'mount'` event listener on sub-apps to associate the `mounted_app` layer with the child Express instance in the `WeakMap` registry.

When `scanLayers()` traverses `layer.name === 'mounted_app'`, it queries `lookupSubApp(layer.handle)` from the `WeakMap` registry. If registered, it retrieves the sub-app's inner `_router.stack` and recursively scans child routes with the mount path prefix.

---

## Current Status & Usage

Mounted sub-applications are fully supported in v0.1.0 via `autoRegister` or `registerSubApp`:

```ts
import express from 'express';
import { autoRegister, scanRoutes } from '@routeui/core';

// Enable automatic sub-app tracking
autoRegister(express);

const app = express();
const subApp = express();
subApp.get('/health', (req, res) => res.send('OK'));

app.use('/api', subApp);

const routes = scanRoutes(app);
// Output includes: GET /api/health
```

If neither registration helper is used, un-registered `mounted_app` layers fall back to being gracefully skipped without error.
