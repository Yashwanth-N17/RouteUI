# Security Policy

## Supported Versions

RouteUI is currently under active development.

Security updates will be provided for the latest release once the project reaches its first stable version.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public GitHub issue**.

Instead:

- Open a private GitHub Security Advisory (when enabled), or
- Contact the project maintainer directly.

Please include:

- A description of the issue
- Steps to reproduce
- Potential impact
- Any suggested fixes (if available)

We appreciate responsible disclosure and will investigate all legitimate reports promptly.

---

## Security Model

### ⚠️ RouteUI is a developer tool — do not expose it in production

RouteUI exposes your **full API route map**, middleware names, handler names, and an
OpenAPI 3.0 spec at `/__routeui/routes` and `/__routeui/openapi.json`. These endpoints
are intended for local development only.

**Default behaviour:**

| `NODE_ENV`     | RouteUI enabled? |
|----------------|-----------------|
| `development`  | ✅ Yes (default) |
| `production`   | ❌ No (silent pass-through) |
| anything else  | ✅ Yes (default) |

**To explicitly control this:**

```ts
// Always disabled (recommended for production deploys):
app.use('/docs', routeui(app, { enabled: false }));

// Always enabled (only do this behind auth middleware):
app.use('/docs', authMiddleware, routeui(app, { enabled: true }));
```

---

### Security Headers

Every response from RouteUI includes the following headers:

| Header                    | Value                     | Purpose                            |
|---------------------------|---------------------------|------------------------------------|
| `X-Content-Type-Options`  | `nosniff`                 | Prevents MIME-type sniffing        |
| `X-Frame-Options`         | `DENY`                    | Prevents clickjacking via iframes  |
| `Referrer-Policy`         | `no-referrer`             | Stops referrer leakage             |
| `Content-Security-Policy` | `default-src 'self'; ...` | HTML responses only; restricts resource loading |

The CSP includes `'unsafe-inline'` for scripts and styles because the UI bundle is
fully self-contained — all JavaScript and CSS are inlined at build time with no
external CDN dependencies.

---

### Bearer Token Storage

The RouteUI UI stores the user-supplied bearer token in `sessionStorage`:

- **Scope:** same-origin only, cleared automatically when the tab closes.
- **Risk:** any JavaScript running on the same origin can read it.
- **Mitigation:** RouteUI is designed to run on `localhost` in development. The risk
  is near zero in that context.

**If you deploy RouteUI to a non-localhost URL**, you must protect the mount path with
authentication middleware. Do **not** rely on the bearer token stored in the UI as a
security boundary.

---

### `dangerouslySetInnerHTML` in Response Viewer

The response body viewer uses `dangerouslySetInnerHTML` to apply syntax highlighting.
This is safe because `colorizeJson` performs full HTML entity escaping (`&`, `<`, `>`,
`"`) **before** any `<span>` tags are injected. A server response containing
`<script>alert(1)</script>` is rendered as literal text, not executed.

---

### CLI: `routeui scan` Executes Files

`routeui scan <file>` dynamically imports and executes the target file. This is
equivalent to running `node <file>` directly — it is intentional behaviour, not a
vulnerability.

> ⚠️ Only scan files you own and trust. Never run `routeui scan` on untrusted or
> third-party files.

---

### Global Express Prototype Patch (`autoRegister`)

`autoRegister` patches `express.application.use` at the prototype level, affecting
every Express application in the same Node.js process. If multiple Express apps share
a process (e.g. in tests), the patch applies to all of them. This is documented
behaviour; a Symbol guard prevents double-patching.
