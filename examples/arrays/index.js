import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import("express").Express} */
const app = express();

// Single route with an array of path aliases
app.get(["/health", "/status", "/ping"], (req, res) => {
  res.json({ status: "healthy", path: req.path });
});

// Multi-path endpoint for API versioning
app.get(["/v1/users", "/v2/users"], (req, res) => {
  res.json({ users: [] });
});

// Multi-path POST endpoint
app.post(["/login", "/signin"], (req, res) => {
  res.json({ authenticated: true });
});

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  app.listen(3005, () => {
    console.log("Arrays example server running on http://localhost:3005");
  });
}
