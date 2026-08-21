import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import("express").Express} */
const app = express();

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

function authenticate(req, res, next) {
  next();
}

function validatePayload(req, res, next) {
  next();
}

function checkPermissions(req, res, next) {
  next();
}

// Public route without middleware
app.get("/public", (req, res) => {
  res.json({ public: true });
});

// Single inline middleware
app.get("/logged", logger, (req, res) => {
  res.json({ logged: true });
});

// Multiple inline middleware handlers
app.get("/protected", authenticate, checkPermissions, (req, res) => {
  res.json({ secret: "data" });
});

app.post("/items", authenticate, validatePayload, (req, res) => {
  res.status(201).json({ created: true });
});

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  app.listen(3003, () => {
    console.log("Middleware example server running on http://localhost:3003");
  });
}
