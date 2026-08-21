import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import("express").Express} */
const app = express();

// Single path parameter
app.get("/users/:id", (req, res) => {
  res.json({ userId: req.params.id });
});

// Multiple path parameters
app.get("/users/:userId/posts/:postId", (req, res) => {
  res.json({ userId: req.params.userId, postId: req.params.postId });
});

// Optional path parameter
app.get("/reports/:year?", (req, res) => {
  res.json({ year: req.params.year || "current" });
});

// Wildcard parameter route
app.get("/files/*", (req, res) => {
  res.json({ path: req.params[0] });
});

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  app.listen(3004, () => {
    console.log("Params example server running on http://localhost:3004");
  });
}
