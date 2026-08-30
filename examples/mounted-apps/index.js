import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import("express").Express} */
const app = express();

// Sub-application for admin features
const adminApp = express();
adminApp.get("/dashboard", (req, res) => {
  res.json({ admin: true, dashboard: "stats" });
});
adminApp.get("/settings", (req, res) => {
  res.json({ admin: true, settings: {} });
});

// Sub-application for user features
const userApp = express();
userApp.get("/profile", (req, res) => {
  res.json({ user: true, profile: { name: "Alice" } });
});
userApp.post("/settings", (req, res) => {
  res.json({ user: true, updated: true });
});

// Mount the sub-apps onto the main app
app.use("/admin", adminApp);
app.use("/user", userApp);

// Main app route
app.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  const server = app.listen(3007, () => {
    console.log("Mounted apps example server running on http://localhost:3007");
  });
  server.on("error", (err) => {
    if (err.code !== "EADDRINUSE") throw err;
  });
}
