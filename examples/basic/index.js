import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import("express").Express} */
const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Basic API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/users", (req, res) => {
  res.json({ users: [] });
});

app.get("/users/profile", function getUserProfile(req, res) {
  res.json({ profile: { id: "123", name: "John Doe", email: "john@example.com" } });
});

app.post("/users", (req, res) => {
  res.status(201).json({ message: "User created" });
});

app.put("/users", (req, res) => {
  res.json({ message: "Users updated" });
});

app.delete("/users", (req, res) => {
  res.json({ message: "Users deleted" });
});

// Serve RouteUI route metadata for UI explorer
app.get("/__routeui/routes", (req, res) => {
  res.json(scanRoutes(app));
});

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  const server = app.listen(3001, () => {
    console.log("Basic example server running on http://localhost:3001");
  });
  server.on("error", (err) => {
    if (err.code !== "EADDRINUSE") throw err;
  });
}
