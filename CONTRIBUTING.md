# Contributing to RouteUI

Thank you for your interest in contributing to RouteUI!

RouteUI is built to bring zero-config, runtime route detection and interactive documentation to Node.js applications. Whether you are fixing a bug, adding new scanner capabilities, building CLI tools, improving documentation, or creating examples, your help is warmly welcomed.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please keep all interactions respectful, constructive, and collaborative.

---

## Getting Started

### 1. Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js**: `>= 18.0.0` (LTS 22.x recommended)
- **pnpm**: `>= 8.0` (Package manager used for monorepo workspaces)
- **Git**: latest version

### 2. Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/Yashwanth-N17/RouteUI.git
cd RouteUI

# Install all workspace dependencies
pnpm install

# Build all workspace packages (@routeui/core, @routeui/cli)
pnpm build
```

---

## Monorepo Workspace Commands

RouteUI uses **pnpm workspaces**. You can run scripts globally from the workspace root:

| Command                    | Description                                                             |
| :------------------------- | :---------------------------------------------------------------------- |
| `pnpm build`               | Compiles TypeScript across all packages using `tsup`.                   |
| `pnpm test`                | Runs the Vitest test suite across all packages.                         |
| `pnpm test:watch`          | Runs Vitest in interactive watch mode for TDD.                          |
| `pnpm test:coverage`       | Runs Vitest and generates code coverage reports.                        |
| `pnpm format`              | Formats all source files, documentation, and JSON files using Prettier. |
| `pnpm routeui scan <file>` | Runs the local `@routeui/cli` binary against a target entry file.       |

---

## Repository Structure

```text
RouteUI/
├── packages/
│   ├── core/                  # @routeui/core runtime scanner engine
│   │   ├── src/
│   │   │   ├── adapters/      # Framework-specific layer adapters (Express)
│   │   │   ├── models/        # Framework-independent route data models
│   │   │   ├── scanner/       # Core recursive scanning logic
│   │   │   └── utils/         # Method normalization & path utilities
│   │   └── tests/             # Vitest scanner unit test suite
│   │
│   └── cli/                   # @routeui/cli command line utility
│       ├── src/
│       │   ├── commands/      # CLI command implementations (scan)
│       │   ├── format/        # Terminal table formatting
│       │   └── utils/         # App dynamic module loader
│       └── tsup.config.ts
│
├── examples/                  # Runnable example Express applications
│   ├── basic/
│   ├── nested/
│   ├── middleware/
│   ├── params/
│   ├── arrays/
│   └── multiple-routers/
│
└── docs/                      # Technical documentation & ADRs
```

---

## Development Workflow

### 1. Adding Scanner Rules & Adapter Features

When enhancing `@routeui/core`:

1. Locate the Express adapter in [`packages/core/src/adapters/express.ts`](packages/core/src/adapters/express.ts).
2. Follow **Test-Driven Development (TDD)**: write a unit test in [`packages/core/tests/scanner.test.ts`](packages/core/tests/scanner.test.ts) demonstrating the expected route discovery before writing the code.
3. Run `pnpm test:watch` while implementing changes.
4. Verify that existing tests continue to pass without regressions.

### 2. Adding CLI Features

When enhancing `@routeui/cli`:

1. Add commands in `packages/cli/src/commands/` or formatters in `packages/cli/src/format/`.
2. Build the CLI package using `pnpm build`.
3. Test commands locally against example projects:
   ```bash
   pnpm routeui scan ./examples/basic/index.js
   ```

### 3. Adding Example Projects

When creating a new example application:

1. Create a new directory under `examples/` (e.g. `examples/my-feature`).
2. Add a `package.json` with `"type": "module"` and reference `"@routeui/core": "workspace:*"`.
3. Create `index.js`, register routes, export default `app`, and add an `app.listen()` block.
4. Document the new example in [`docs/examples.md`](docs/examples.md) and [`examples/README.md`](examples/README.md).

---

## Commit Message Guidelines

We follow the [Conventional Commits specification](https://www.conventionalcommits.org/).

### Format

```text
<type>(<scope>): <short summary>
```

### Supported Types

- `feat`: A new feature or scanner capability
- `fix`: A bug fix in scanner, CLI, or adapters
- `docs`: Documentation changes or guide additions
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Maintenance, build tasks, or dependency updates

### Examples

```text
feat(core): add support for optional path parameters
fix(cli): handle CommonJS default export wrapper cleanly
docs: create CLI usage and examples guide
test(core): add tests for multi-path array route definitions
```

---

## Pull Request Guidelines

Before submitting a Pull Request (PR):

1. **Format Code:** Run `pnpm format` to format all code.
2. **Build Workspace:** Run `pnpm build` to verify clean compilation without TypeScript errors.
3. **Run Tests:** Ensure all unit tests pass with `pnpm test`.
4. **Update Documentation:** Update relevant docs in `docs/` or package READMEs if changing public APIs or CLI flags.
5. **Keep PRs Focused:** Submit small, self-contained PRs addressing one feature or fix at a time.

---

## Reporting Issues

If you encounter a bug or have a feature request:

1. Search [Existing Issues](https://github.com/Yashwanth-N17/RouteUI/issues) to avoid duplicate reports.
2. Open a new issue with a clear title and description.
3. Include relevant environment details:
   - Node.js version (`node -v`)
   - Package manager version (`pnpm -v`)
   - Operating System
   - Minimal reproduction code or repository link

---

## Questions & Feedback

If you have questions about architecture or design decisions, feel free to open a GitHub Discussion or issue before starting implementation!
