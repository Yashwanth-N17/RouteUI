# RouteUI Architecture

## Overview

RouteUI is a runtime API documentation library for Express.js.

Unlike traditional documentation generators that rely on OpenAPI specifications or decorators, RouteUI inspects the application's routing tree at runtime and builds an internal representation of every discovered endpoint.

The project is designed around a modular architecture so additional frameworks such as Fastify and Hono can be supported without changing the core scanning engine.

---

# High-Level Architecture

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
               Internal Route Model
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 Interactive Documentation         Exporters
        UI                     (OpenAPI, JSON, etc.)
```

---

# Design Goals

RouteUI is built around the following principles:

- Runtime-first architecture
- Zero configuration
- Framework abstraction
- Type safety
- Extensibility
- Minimal runtime overhead

---

# Project Structure

```text
RouteUI/
├── packages/
│   └── core/
│       ├── src/
│       │   ├── adapters/
│       │   ├── models/
│       │   ├── types/
│       │   ├── utils/
│       │   └── index.ts
│       │
│       └── tests/
│
├── examples/
│   ├── basic/
│   ├── nested/
│   ├── middleware/
│   ├── params/
│   ├── arrays/
│   └── multiple-routers/
│
├── docs/
│
└── .github/
```

---

# Core Components

## Express Adapter

Responsible for interacting with Express internals.

Responsibilities:

- Read Express routing structures
- Convert framework-specific objects into RouteUI models
- Hide Express implementation details from the scanner

This layer is the only part of RouteUI that should directly depend on Express internals.

---

## Runtime Scanner

The scanner traverses Express routing structures and extracts route metadata.

Responsibilities:

- Traverse routing stacks
- Detect HTTP methods
- Extract paths
- Build internal route objects

Future versions will support:

- Nested routers
- Middleware detection
- Route metadata
- Parameter extraction

---

## Internal Route Model

The scanner never exposes Express objects directly.

Instead, every discovered endpoint is converted into an internal representation.

Example:

```ts
interface InternalRoute {
  method: HttpMethod;
  path: string;
}
```

Future versions may include:

- Parameters
- Middleware
- Request schemas
- Response schemas
- Authentication metadata

---

## Utilities

Utility modules provide reusable functionality shared across the project.

Examples:

- HTTP method normalization
- Type helpers
- Shared constants

---

# Why an Adapter?

Express uses private internal objects to represent routes.

Rather than coupling the scanner directly to Express, RouteUI introduces an adapter layer.

```text
Before

Scanner
   │
   ▼
Express Internals

After

Scanner
   │
   ▼
Express Adapter
   │
   ▼
Express Internals
```

Benefits:

- Easier maintenance
- Better separation of concerns
- Future framework support

---

# Runtime Flow

Current execution flow:

```text
Express App
      │
      ▼
getExpressRoutes(app)
      │
      ▼
Express Adapter
      │
      ▼
Extract Express Layers
      │
      ▼
Create InternalRoute[]
      │
      ▼
Return Results
```

Future flow:

```text
Express App
      │
      ▼
Express Adapter
      │
      ▼
Recursive Scanner
      │
      ▼
InternalRoute[]
      │
      ▼
Interactive UI
```

---

# Testing Strategy

RouteUI uses unit testing to validate scanner behavior.

Every new capability should begin with a failing test before implementation.

Current tests include:

- Single route detection
- Multiple route detection

Upcoming tests:

- Nested routers
- Route parameters
- Middleware detection
- Edge cases

---

# Future Architecture

As RouteUI grows, additional packages are planned.

```text
packages/

core/
Runtime scanner

ui/
Embedded documentation UI

openapi/
OpenAPI exporter

cli/
Command-line interface

fastify/
Fastify adapter

hono/
Hono adapter
```

The long-term goal is to keep the scanner framework-agnostic while implementing adapters for each supported framework.

---

# Architecture Principles

Every major architectural decision should satisfy the following:

- Single Responsibility Principle
- Strong typing
- Testability
- Framework independence
- Backward compatibility where possible
- Clear separation between public APIs and internal implementation

---

# Current Status

## Completed

- Monorepo foundation
- Build pipeline
- Runtime scanner
- Express adapter
- Internal route model
- Initial unit tests

## In Progress

- Recursive scanner
- Nested router traversal
- Middleware detection

## Planned

- Interactive documentation UI
- Exporters
- Multi-framework support
- Stable public API
