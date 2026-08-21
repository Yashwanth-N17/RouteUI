# Runtime Scanner

## Overview

The Runtime Scanner is the core engine of RouteUI.

Its responsibility is to inspect an Express application's routing tree at runtime and convert every discovered endpoint into RouteUI's internal route representation.

Unlike documentation generators that rely on OpenAPI specifications, decorators, or code generation, RouteUI discovers routes directly from the running application.

---

# Why Runtime Scanning?

Most documentation tools require developers to maintain separate documentation.

Example:

```text
Express Routes
        │
        ▼
Write OpenAPI Specification
        │
        ▼
Generate Documentation
```

This creates duplication.

Whenever routes change, documentation must also be updated.

RouteUI removes this duplication.

```text
Express Application
        │
        ▼
Runtime Scanner
        │
        ▼
Interactive Documentation
```

The documentation is generated from the application's routing structure instead of a manually maintained specification.

---

# Scanner Architecture

The scanner is intentionally divided into multiple layers.

```text
Express Application
        │
        ▼
Express Adapter
        │
        ▼
Runtime Scanner
        │
        ▼
InternalRoute[]
```

Each layer has a single responsibility.

---

# Current Flow

Current implementation:

```text
Express App
      │
      ▼
getExpressRoutes(app)
      │
      ▼
Read Express Router Stack
      │
      ▼
Extract Route Layers
      │
      ▼
Convert To InternalRoute[]
      │
      ▼
Return Result
```

---

# Express Internals

Express stores routes internally as a stack of **Layer** objects.

Simplified representation:

```text
Router
│
└── stack
      │
      ├── Layer
      ├── Layer
      └── Layer
```

Each Layer represents either:

- a route
- middleware
- a mounted router

---

# Route Layer

A normal route looks like:

```text
Layer
│
├── route
│     ├── path
│     ├── methods
│     └── stack
│
└── handle
```

Example:

```ts
app.get("/users", handler);
```

Internally becomes something similar to:

```text
Layer
└── route
      ├── path = "/users"
      └── methods = { get: true }
```

---

# Mounted Router

Mounted routers are different.

Example:

```ts
const router = express.Router();

router.get("/users", handler);

app.use("/api", router);
```

Express represents this approximately as:

```text
Layer
│
├── route = undefined
│
└── handle
      │
      ▼
    Router
      │
      ▼
    stack
```

This means a mounted router does **not** behave like a normal route.

Instead, it contains another routing stack.

---

# Why Recursion?

The routing structure forms a tree.

Example:

```text
App
│
├── GET /
│
└── /api
      │
      ├── GET /users
      │
      └── /v1
             │
             └── GET /products
```

A simple loop only scans one level.

To support nested routers, the scanner must recursively traverse child routing stacks.

Conceptually:

```text
scan(stack)
    │
    ├── Route
    │      │
    │      ▼
    │   Collect
    │
    └── Router
           │
           ▼
      scan(childStack)
```

---

# Adapter Pattern

The runtime scanner never directly depends on Express throughout the codebase.

Instead:

```text
Express
     │
     ▼
Express Adapter
     │
     ▼
Scanner
```

Responsibilities of the adapter:

- Read Express internals
- Normalize framework-specific objects
- Protect the scanner from framework changes

This architecture allows future adapters for:

- Fastify
- Hono
- Koa

without changing the scanner implementation.

---

# Internal Route Model

Discovered routes are converted into a framework-independent model.

Current structure:

```ts
interface InternalRoute {
  method: HttpMethod;
  path: string;
}
```

Future versions may include:

```ts
interface InternalRoute {
  method: HttpMethod;
  path: string;

  parameters?: Parameter[];
  middleware?: Middleware[];
  requestSchema?: unknown;
  responseSchema?: unknown;
  authentication?: AuthenticationMetadata;
}
```

The scanner always works with this internal model rather than exposing Express-specific objects.

---

# Testing Strategy

The runtime scanner is validated using unit tests.

Current coverage includes:

- Single route detection
- Multiple route detection
- Nested routers and deeply nested routers
- Empty routers
- Routes created with `app.route()` and `router.route()`
- Route parameters
- Multiple path definitions per route

Upcoming tests include:

- Middleware detection
- Edge cases

Every new scanner feature should begin with a failing test before implementation.

---

# Current Limitations

Current implementation supports:

- Direct routes
- HTTP method detection
- Internal route conversion
- Nested routers and deeply nested routers (recursive traversal)
- Multiple path definitions per route
- Route parameter detection

Current limitations:

- Mounted express applications (e.g. `app.use('/admin', adminApp)`)
- Middleware detection
- Route metadata extraction

These features are currently under active development.

---

# Future Improvements

The runtime scanner will continue to evolve with support for:

- Mounted express applications traversal
- Middleware analysis
- Authentication detection
- Request and response schema discovery
- Framework-independent scanning engine

---

# Design Principles

The scanner follows a small set of design principles:

- Runtime-first
- Framework abstraction
- Strong typing
- Test-driven development
- Single responsibility
- Extensibility

Every new feature should preserve these principles while keeping the scanner simple, maintainable, and framework-independent.
