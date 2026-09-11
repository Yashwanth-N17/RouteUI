import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import('express').Express} */
const app = express();

app.get("/", (req, res) => res.json({ message: "Welcome to the Exclude API" }));
app.get("/public", (req, res) => res.json({ public: true }));
app.get("/private/data", (req, res) => res.json({ secret: "data" }));
app.get("/admin/dashboard", (req, res) => res.json({ admin: true }));
app.post("/internal/webhook", (req, res) => res.json({ received: true }));
app.get("/api/v1/beta-feature", (req, res) => res.json({ beta: true }));

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  const options = {
    exclude: [
      "/private", // Prefix string match
      /^\/admin/, // RegExp match for starting with /admin
      "/internal/webhook" // Exact path match via prefix
    ]
  };
  console.log("Scanned Routes (with exclusions):", scanRoutes(app, options));
  const server = app.listen(3006, () => {
    console.log("Exclude example server running on http://localhost:3006");
  });
  server.on("error", (err) => {
    if (err.code !== "EADDRINUSE") throw err;
  });
}
