# @routeui/express

Express middleware for RouteUI to automatically serve interactive API documentation and testing UI directly from your Express application.

## Installation

```bash
npm install @routeui/express
# or
pnpm add @routeui/express
```

## Usage

```typescript
import express from "express";
import { routeui } from "@routeui/express";

const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello World" });
});

// Serve RouteUI interactive documentation at /docs
app.use("/docs", routeui(app));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Docs available at http://localhost:3000/docs");
});
```
