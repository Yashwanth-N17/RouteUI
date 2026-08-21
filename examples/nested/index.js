import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import("express").Express} */
const app = express();

const apiRouter = express.Router();
const v1Router = express.Router();
const adminRouter = express.Router();

// Admin sub-router endpoints
adminRouter.get("/analytics", (req, res) => {
  res.json({ analytics: true });
});

adminRouter.get("/settings", (req, res) => {
  res.json({ settings: {} });
});

// v1 sub-router endpoints & nested admin router mount
v1Router.get("/status", (req, res) => {
  res.json({ v1: "active" });
});
v1Router.use("/admin", adminRouter);

// API main router endpoints & nested v1 router mount
apiRouter.get("/ping", (req, res) => {
  res.send("pong");
});
apiRouter.use("/v1", v1Router);

// Mount top-level API router on main app
app.use("/api", apiRouter);

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  app.listen(3002, () => {
    console.log("Nested example server running on http://localhost:3002");
  });
}
