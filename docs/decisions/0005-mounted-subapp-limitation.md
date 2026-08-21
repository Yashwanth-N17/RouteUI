# ADR 0005 — Mounted Sub-Application Routes Not Supported in v0.1.0

**Date:** 2026-07-25  
**Status:** Accepted  
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

This is distinct from the already-supported `express.Router()` pattern:

```js
const router = express.Router()  // ← this works fine
router.get('/health', handler)
app.use('/api', router)
```

---

## Investigation

A thorough runtime investigation was conducted. The findings are as follows.

### What Express does internally

When `app.use('/api', subApp)` is called (both Express 4 and Express 5),
Express detects the sub-app by checking `fn.handle && fn.set`, then stores it
in the router stack like this:

```js
// From express/lib/application.js
router.use(path, function mounted_app(req, res, next) {
  var orig = req.app;
  fn.handle(req, res, function (err) {   // fn = the sub-app
    setPrototypeOf(req, orig.request)
    setPrototypeOf(res, orig.response)
    next(err);
  });
});
```

The layer stored in `app._router.stack` is:

```
layer.name   = "mounted_app"       ✅ detectable
layer.handle = mounted_app         ✅ accessible
layer.handle._router               ❌ undefined — always
layer.handle.fn                    ❌ undefined — always
```

### The closure wall

`fn` (the sub-app) is captured inside the `mounted_app` closure.
JavaScript closures do not expose their local variables as accessible
properties — this is intentional language behaviour, not a bug.

Runtime inspection confirmed:

```
layer.handle === subApp:  false   (layer.handle is the WRAPPER, not the sub-app)
Object.getOwnPropertyNames(layer.handle) → ['length', 'name', 'prototype']
layer.handle._router     → undefined
layer.handle.fn          → undefined
```

`fn` cannot be retrieved from `layer.handle` by any standard means.

### What cannot be done without instrumentation

- `layer.handle._router`       — not a property; always `undefined`
- `layer.handle.fn`            — not a property; always `undefined`
- Closure variable access      — not possible in JavaScript
- `Object.getOwnPropertySymbols(handle)` — empty; no hidden symbol keys

The sub-app's `_router` is only accessible on the `subApp` variable itself
(`subApp._router`), which is not reachable from the layer at all.

---

## Decision

**Mounted sub-applications are gracefully skipped in v0.1.0.**

When `layer.name === 'mounted_app'` is encountered during layer traversal,
`scanLayers()` skips the layer and continues — it does not crash, does not
emit a warning, and does not attempt to traverse into the layer.

The reason this is the right choice for v0.1.0:

| Factor | Detail |
|--------|--------|
| Complexity | Instrumentation requires monkey-patching `app.use()`, which changes the public API |
| Maturity | v0.1.0 should establish a stable API before adding instrumentation hooks |
| Workaround quality | `express.Router()` is the recommended Express pattern for route grouping; sub-apps are for isolated Express instances with different settings |
| User impact | Most real-world Express apps use `Router`, not sub-apps, for route grouping |

---

## Consequences

### v0.1.0 behaviour

- Routes inside mounted sub-apps are silently omitted.
- `express.Router()` (the recommended alternative) works correctly.
- No crash occurs when a sub-app is mounted.
- A clear comment in [`adapters/express.ts`](../../packages/core/src/adapters/express.ts) explains the skip.

### Documentation

The README includes a **Known Limitations** section explaining:
- What does not work and why
- The workaround (`express.Router()`)
- That instrumentation-based support is planned for v0.2.0

### v0.2.0 plan — Instrumentation

The correct solution is opt-in instrumentation: RouteUI patches `app.use()`
before sub-apps are mounted, stores references in a `WeakMap`, and uses them
during scanning. Sketch:

```ts
// v0.2.0 API (planned — NOT in v0.1.0)
import { instrumentApp, scanRoutes } from '@routeui/core'

const app = express()
instrumentApp(app)  // must be called before app.use(subApp)

const subApp = express()
subApp.get('/health', handler)
app.use('/api', subApp)

scanRoutes(app)  // now sees /api/health
```

This is an **additive, opt-in API change** — existing code that does not call
`instrumentApp` continues to work exactly as in v0.1.0.

---

## Alternatives Considered

| Alternative | Reason rejected |
|-------------|-----------------|
| `layer.handle._router` access | Property does not exist; `undefined` at runtime |
| Parse `layer.handle.toString()` to extract closure variable names | Unreliable; minified code breaks it; hack-level |
| Require users to pass sub-apps explicitly to `scanRoutes` | Changes public API; breaks zero-config promise |
| v8 debug API / `%GetClosureVariable()` | Non-standard; breaks in production; security implications |
