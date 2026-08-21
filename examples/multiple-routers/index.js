import express from "express";
import { scanRoutes } from "@routeui/core";

/** @type {import("express").Express} */
const app = express();

// Multiple distinct router instances
const authRouter = express.Router();
const userRouter = express.Router();
const productRouter = express.Router();
const orderRouter = express.Router();

// Auth Router routes
authRouter.post("/login", (req, res) => res.json({ token: "xyz" }));
authRouter.post("/logout", (req, res) => res.json({ success: true }));

// User Router routes
userRouter.get("/", (req, res) => res.json({ users: [] }));
userRouter.get("/me", (req, res) => res.json({ profile: {} }));

// Product Router routes
productRouter.get("/", (req, res) => res.json({ products: [] }));
productRouter.get("/search", (req, res) => res.json({ results: [] }));

// Order Router routes
orderRouter.get("/", (req, res) => res.json({ orders: [] }));
orderRouter.post("/", (req, res) => res.json({ orderId: 1 }));

// Mount all routers at distinct prefixes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);

export default app;

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  console.log("Scanned Routes:", scanRoutes(app));
  app.listen(3006, () => {
    console.log("Multiple routers example server running on http://localhost:3006");
  });
}
