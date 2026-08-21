# `@routeui/cli`

Command-line interface for **RouteUI** — inspect Express application routes dynamically in your terminal.

---

## Installation

```bash
# Using pnpm
pnpm add -D @routeui/cli

# Using npm
npm install --save-dev @routeui/cli
```

Or run directly without installation using `npx`:

```bash
npx @routeui/cli scan ./app.js
```

---

## Usage

```bash
routeui scan <entry-file>
```

### Example

```bash
routeui scan ./index.js
```

### Output

```text
RouteUI
────────────────────────────────────────

✓ Scanned 3 routes

METHOD    PATH                          HANDLER             MIDDLEWARE
------    ----                          -------             ----------
GET       /                             getRoot             -
GET       /users                        getUsers            auth
POST      /users                        createUser          auth
```

---

## Requirements

The entry file passed to `routeui scan` must export an Express application instance:

```javascript
// ESM
export default app;

// CommonJS
module.exports = app;
```

---

## License

MIT © RouteUI Team
