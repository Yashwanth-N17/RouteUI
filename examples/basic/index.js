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

app.post("/users", (req, res) => {
  res.status(201).json({ message: "User created" });
});

app.put("/users", (req, res) => {
  res.json({ message: "Users updated" });
});

app.delete("/users", (req, res) => {
  res.json({ message: "Users deleted" });
});

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  app.listen(3001, () => {
    console.log("Basic example server running on http://localhost:3001");
  });
}
