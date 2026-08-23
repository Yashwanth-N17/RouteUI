# @routeui/core

Runtime route detection engine for Express.js. Scans your application's router stack at runtime and returns a structured list of every registered endpoint — no decorators, no spec files, no code generation.

This is the low-level programmatic API. Most users will want [`@routeui/express`](https://www.npmjs.com/package/@routeui/express) instead, which builds on this package and mounts an interactive documentation UI in one line.

## Installation

```bash
npm install @routeui/core
# or
pnpm add @routeui/core
```

## Usage

### Scan routes from an Express app

```typescript
import express from 'express';
import { scanRoutes } from '@routeui/core';

const app = express();

app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.json({ status: 'created' }));
app.get('/users/:id', (req, res) => res.json({ id: req.params.id }));

const routes = scanRoutes(app);
console.log(routes);
/*
[
  { method: 'GET',  path: '/users',     handlers: ['<anonymous>'], middleware: [] },
  { method: 'POST', path: '/users',     handlers: ['<anonymous>'], middleware: [] },
  { method: 'GET',  path: '/users/:id', handlers: ['<anonymous>'], middleware: [] }
]
*/
```

### Mounted sub-application support

Standard `express.Router()` instances are detected automatically. For mounted sub-applications (`express()` instances passed to `app.use()`), call `autoRegister` once before creating any sub-apps:

```typescript
import express from 'express';
import { autoRegister, scanRoutes } from '@routeui/core';

// Patch express.application.use globally (call once at startup)
autoRegister(express);

const app = express();
const subApp = express();

subApp.get('/health', (req, res) => res.send('OK'));
app.use('/api', subApp);

const routes = scanRoutes(app);
// Includes: GET /api/health
```

Alternatively, use `registerSubApp` to register individual sub-apps without the global patch:

```typescript
import { registerSubApp } from '@routeui/core';

registerSubApp(subApp); // call before app.use()
app.use('/api', subApp);
```

### Export an OpenAPI 3.0 document

```typescript
import { scanRoutes, toOpenApi } from '@routeui/core';

const routes = scanRoutes(app);
const spec = toOpenApi(routes, { title: 'My API', version: '1.0.0' });

console.log(JSON.stringify(spec, null, 2));
```

## API

### `scanRoutes(app: Express): InternalRoute[]`

Scans the Express application and returns an array of discovered routes. Call this after all routes are registered.

### `autoRegister(expressModule: typeof express): void`

Patches `express.application.use` at the prototype level so that any sub-app mounted via `app.use(path, subApp)` is automatically tracked. Call once before creating any Express instances.

### `registerSubApp(subApp: Express): void`

Registers a single sub-application instance using Express's `'mount'` event. Use this as a scoped alternative to `autoRegister` when you do not want to patch the global prototype.

### `toOpenApi(routes: InternalRoute[], options): OpenApiDocument`

Converts a route list into an OpenAPI 3.0 document object.

## Requirements

- Node.js >= 18
- Express >= 4.17 or Express 5.x (peer dependency — not bundled)

## License

MIT
