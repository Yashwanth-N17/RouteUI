# Examples Guide

RouteUI comes with 6 standalone example applications in the [`examples/`](../examples) directory. Each example illustrates a specific Express routing configuration and demonstrates how `@routeui/core` and `@routeui/cli` discover endpoints at runtime.

---

## Example Overview

| Example Directory                                           | Scenario Demonstrated        | Key Features Inspected                                                        |
| :---------------------------------------------------------- | :--------------------------- | :---------------------------------------------------------------------------- |
| [`examples/basic`](../examples/basic)                       | Standard Express App         | Single router, direct HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).          |
| [`examples/nested`](../examples/nested)                     | Multi-Level Router Nesting   | Recursive router mounting (`app.use('/api', apiRouter.use('/v1', ...))`).     |
| [`examples/middleware`](../examples/middleware)             | Middleware Stack Traversal   | Route-level and router-level inline middleware detection.                     |
| [`examples/params`](../examples/params)                     | Route Path Parameters        | Single, multiple (`:userId/posts/:postId`), optional (`:year?`), & wildcards. |
| [`examples/arrays`](../examples/arrays)                     | Multi-Path Array Definitions | Routes registered with path array aliases (`['/health', '/status']`).         |
| [`examples/multiple-routers`](../examples/multiple-routers) | Multiple Mounted Routers     | Independent router instances mounted at distinct path prefixes.               |

---

## Running Examples Locally

You can run any example using `pnpm` workspace filters, or directly via `node`:

### Using `pnpm` Workspace Filters

```bash
# Run Basic Example
pnpm --filter basic-example start

# Run Nested Router Example
pnpm --filter nested-example start

# Run Middleware Example
pnpm --filter middleware-example start

# Run Params Example
pnpm --filter params-example start

# Run Arrays Example
pnpm --filter arrays-example start

# Run Multiple Routers Example
pnpm --filter multiple-routers-example start
```

### Direct Execution with `node`

```bash
node examples/basic/index.js
node examples/nested/index.js
node examples/middleware/index.js
node examples/params/index.js
node examples/arrays/index.js
node examples/multiple-routers/index.js
```

### Inspecting Examples with RouteUI CLI

You can also use `@routeui/cli` to scan any example entry file without launching a server:

```bash
pnpm routeui scan ./examples/basic/index.js
pnpm routeui scan ./examples/nested/index.js
pnpm routeui scan ./examples/middleware/index.js
```

---

## Detailed Example Breakdown

### 1. Basic Example (`examples/basic`)

Demonstrates standard endpoint registrations directly on the main `app` instance.

#### Code Snippet (`index.js`)

```javascript
import express from "express";
import { scanRoutes } from "@routeui/core";

const app = express();

app.get("/", (req, res) => res.json({ message: "Welcome" }));
app.get("/users", (req, res) => res.json({ users: [] }));
app.post("/users", (req, res) => res.status(201).json({ message: "Created" }));
app.put("/users", (req, res) => res.json({ message: "Updated" }));
app.delete("/users", (req, res) => res.json({ message: "Deleted" }));

export default app;
```

#### Scan Result

```text
METHOD    PATH       HANDLER     MIDDLEWARE
------    ----       -------     ----------
GET       /          anonymous   -
GET       /health    anonymous   -
GET       /users     anonymous   -
POST      /users     anonymous   -
PUT       /users     anonymous   -
DELETE    /users     anonymous   -
```

---

### 2. Nested Router Example (`examples/nested`)

Demonstrates recursive route discovery across multi-level nested routers:
`app` ➔ `/api` (`apiRouter`) ➔ `/v1` (`v1Router`) ➔ `/admin` (`adminRouter`).

#### Code Snippet (`index.js`)

```javascript
const apiRouter = express.Router();
const v1Router = express.Router();
const adminRouter = express.Router();

adminRouter.get("/analytics", (req, res) => res.json({ analytics: true }));

v1Router.get("/status", (req, res) => res.json({ v1: "active" }));
v1Router.use("/admin", adminRouter);

apiRouter.get("/ping", (req, res) => res.send("pong"));
apiRouter.use("/v1", v1Router);

app.use("/api", apiRouter);
```

#### Scan Result

```text
METHOD    PATH                        HANDLER     MIDDLEWARE
------    ----                        -------     ----------
GET       /api/ping                   anonymous   -
GET       /api/v1/status              anonymous   -
GET       /api/v1/admin/analytics     anonymous   -
GET       /api/v1/admin/settings      anonymous   -
```

---

### 3. Middleware Example (`examples/middleware`)

Demonstrates detection of route handler names and attached middleware.

#### Code Snippet (`index.js`)

```javascript
function logger(req, res, next) {
  next();
}
function authenticate(req, res, next) {
  next();
}

app.get("/public", (req, res) => res.json({ public: true }));
app.get("/logged", logger, (req, res) => res.json({ logged: true }));
app.get("/protected", authenticate, (req, res) => res.json({ secret: true }));
```

#### Scan Result

```text
METHOD    PATH          HANDLER     MIDDLEWARE
------    ----          -------     ----------
GET       /public       anonymous   -
GET       /logged       anonymous   logger
GET       /protected    anonymous   authenticate
```

---

### 4. Route Parameters Example (`examples/params`)

Demonstrates handling of path variables, optional parameters, and wildcards.

#### Code Snippet (`index.js`)

```javascript
app.get("/users/:id", (req, res) => res.json({ id: req.params.id }));
app.get("/users/:userId/posts/:postId", (req, res) => res.json(req.params));
app.get("/reports/:year?", (req, res) => res.json(req.params));
app.get("/files/*", (req, res) => res.json(req.params));
```

#### Scan Result

```text
METHOD    PATH                             HANDLER     MIDDLEWARE
------    ----                             -------     ----------
GET       /users/:id                       anonymous   -
GET       /users/:userId/posts/:postId     anonymous   -
GET       /reports/:year?                  anonymous   -
GET       /files/*                         anonymous   -
```

---

### 5. Multi-Path Array Example (`examples/arrays`)

Demonstrates routes registered with an array of path aliases in a single definition.

#### Code Snippet (`index.js`)

```javascript
app.get(["/health", "/status", "/ping"], (req, res) => {
  res.json({ status: "healthy" });
});

app.get(["/v1/users", "/v2/users"], (req, res) => {
  res.json({ users: [] });
});
```

#### Scan Result

RouteUI splits multi-path array declarations into individual endpoint records:

```text
METHOD    PATH          HANDLER     MIDDLEWARE
------    ----          -------     ----------
GET       /health       anonymous   -
GET       /status       anonymous   -
GET       /ping         anonymous   -
GET       /v1/users     anonymous   -
GET       /v2/users     anonymous   -
```

---

### 6. Multiple Routers Example (`examples/multiple-routers`)

Demonstrates an application with multiple independent routers mounted under distinct top-level paths (`/auth`, `/users`, `/products`, `/orders`).

#### Code Snippet (`index.js`)

```javascript
const authRouter = express.Router();
authRouter.post("/login", (req, res) => res.json({ token: "xyz" }));

const userRouter = express.Router();
userRouter.get("/", (req, res) => res.json({ users: [] }));

app.use("/auth", authRouter);
app.use("/users", userRouter);
```

#### Scan Result

```text
METHOD    PATH            HANDLER     MIDDLEWARE
------    ----            -------     ----------
POST      /auth/login     anonymous   -
POST      /auth/logout    anonymous   -
GET       /users          anonymous   -
GET       /users/me       anonymous   -
GET       /products       anonymous   -
GET       /products/search anonymous  -
GET       /orders         anonymous   -
POST      /orders         anonymous   -
```

---

## Adding New Examples

To add a new example application:

1. Create a subdirectory under `examples/` (e.g. `examples/custom/`).
2. Add a `package.json` with `"type": "module"` and `"dependencies": { "@routeui/core": "workspace:*", "express": "^4.21.0" }`.
3. Create `index.js`, importing Express and `@routeui/core`, registering routes, and exporting `default app`.
4. Add startup logic inside `if (process.argv[1] && process.argv[1].endsWith("index.js"))`.
5. Run `pnpm install` at workspace root to link workspace dependencies.
