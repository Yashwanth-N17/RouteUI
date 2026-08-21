import express from "express";
import { describe, expect, it } from "vitest";
import { scanRoutes, registerSubApp, autoRegister } from "../src/index.js";

describe("scanRoutes", () => {
  describe("GET routes", () => {
    it("should detect simple GET routes", () => {
      const app = express();
      app.get("/", () => {});
      app.get("/health", () => {});

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/", handlers: ["<anonymous>"], middleware: [] },
        { method: "GET", path: "/health", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });

    it("should detect GET routes with named function handlers", () => {
      const app = express();
      function handleRoot(req: any, res: any) {}
      function handleUsers(req: any, res: any) {}

      app.get("/", handleRoot);
      app.get("/users", handleUsers);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/", handlers: ["handleRoot"], middleware: [] },
        { method: "GET", path: "/users", handlers: ["handleUsers"], middleware: [] },
      ]);
    });
  });

  describe("POST routes", () => {
    it("should detect POST routes", () => {
      const app = express();
      function createUser(req: any, res: any) {}

      app.post("/users", createUser);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "POST", path: "/users", handlers: ["createUser"], middleware: [] },
      ]);
    });

    it("should detect POST and GET routes on the same path", () => {
      const app = express();
      function getUsers(req: any, res: any) {}
      function createUser(req: any, res: any) {}

      app.get("/users", getUsers);
      app.post("/users", createUser);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/users", handlers: ["getUsers"], middleware: [] },
        { method: "POST", path: "/users", handlers: ["createUser"], middleware: [] },
      ]);
    });
  });

  describe("Nested routers", () => {
    it("should detect routes in mounted express sub-apps with registerSubApp", () => {
      const app = express();
      const subApp = express();
      registerSubApp(subApp); // opt-in registration

      subApp.get("/:id", () => {});
      app.use("/api/users", subApp);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/api/users/:id", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });

    it("should detect routes in mounted express sub-apps with autoRegister", () => {
      autoRegister(express);
      
      const app = express();
      const subApp = express(); // automatically registered when passed to app.use()

      subApp.get("/:id", () => {});
      app.use("/api/users", subApp);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/api/users/:id", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });

    it("should detect single level nested router", () => {
      const app = express();
      const apiRouter = express.Router();

      apiRouter.get("/users", () => {});
      app.use("/api", apiRouter);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/api/users", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });

    it("should detect deeply nested routers (3+ levels)", () => {
      const app = express();
      const apiRouter = express.Router();
      const v1Router = express.Router();
      const adminRouter = express.Router();

      adminRouter.get("/stats", () => {});
      v1Router.use("/admin", adminRouter);
      apiRouter.use("/v1", v1Router);
      app.use("/api", apiRouter);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/api/v1/admin/stats", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });

    it("should handle a router mounted at the root path", () => {
      const app = express();
      const router = express.Router();

      router.get("/items", () => {});
      app.use(router);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/items", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });
  });

  describe("Middleware extraction", () => {
    it("should extract single middleware function name", () => {
      const app = express();
      function logger(req: any, res: any, next: any) {
        next();
      }
      function handler(req: any, res: any) {}

      app.get("/logged", logger, handler);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        {
          method: "GET",
          path: "/logged",
          handlers: ["handler"],
          middleware: ["logger"],
        },
      ]);
    });

    it("should extract multiple middleware function names in correct execution order", () => {
      const app = express();
      function auth(req: any, res: any, next: any) {
        next();
      }
      function validate(req: any, res: any, next: any) {
        next();
      }
      function createPost(req: any, res: any) {}

      app.post("/posts", auth, validate, createPost);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        {
          method: "POST",
          path: "/posts",
          handlers: ["createPost"],
          middleware: ["auth", "validate"],
        },
      ]);
    });

    it("should report empty middleware array for routes without middleware", () => {
      const app = express();
      function simpleHandler(req: any, res: any) {}

      app.get("/simple", simpleHandler);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        {
          method: "GET",
          path: "/simple",
          handlers: ["simpleHandler"],
          middleware: [],
        },
      ]);
    });
  });

  describe("Handler extraction", () => {
    it("should extract named handler function names", () => {
      const app = express();
      function getProfile(req: any, res: any) {}

      app.get("/profile", getProfile);

      const routes = scanRoutes(app);

      expect(routes[0]!.handlers).toEqual(["getProfile"]);
    });

    it("should label anonymous functions as <anonymous>", () => {
      const app = express();
      app.get("/anon", (req, res) => {});

      const routes = scanRoutes(app);

      expect(routes[0]!.handlers).toEqual(["<anonymous>"]);
    });

    it("should extract handlers when using chained route methods", () => {
      const app = express();
      function getUser(req: any, res: any) {}
      function updateUser(req: any, res: any) {}
      function deleteUser(req: any, res: any) {}

      app.route("/user").get(getUser).put(updateUser).delete(deleteUser);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/user", handlers: ["getUser"], middleware: [] },
        { method: "PUT", path: "/user", handlers: ["updateUser"], middleware: [] },
        { method: "DELETE", path: "/user", handlers: ["deleteUser"], middleware: [] },
      ]);
    });
  });

  describe("Route params", () => {
    it("should detect single route parameters", () => {
      const app = express();
      app.get("/users/:id", () => {});

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/users/:id", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });

    it("should detect multiple route parameters in path", () => {
      const app = express();
      app.get("/users/:userId/posts/:postId", () => {});

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        {
          method: "GET",
          path: "/users/:userId/posts/:postId",
          handlers: ["<anonymous>"],
          middleware: [],
        },
      ]);
    });

    it("should detect optional route parameters", () => {
      const app = express();
      app.get("/reports/:year?", () => {});

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/reports/:year?", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });

    it("should detect wildcard route parameters", () => {
      const app = express();
      app.get("/files/*", () => {});

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/files/*", handlers: ["<anonymous>"], middleware: [] },
      ]);
    });
  });

  describe("Multiple routers", () => {
    it("should detect routes from multiple separate router instances mounted at different prefixes", () => {
      const app = express();
      const authRouter = express.Router();
      const userRouter = express.Router();
      const productRouter = express.Router();

      function login(req: any, res: any) {}
      function getUsers(req: any, res: any) {}
      function getProducts(req: any, res: any) {}

      authRouter.post("/login", login);
      userRouter.get("/", getUsers);
      productRouter.get("/", getProducts);

      app.use("/auth", authRouter);
      app.use("/users", userRouter);
      app.use("/products", productRouter);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "POST", path: "/auth/login", handlers: ["login"], middleware: [] },
        { method: "GET", path: "/users", handlers: ["getUsers"], middleware: [] },
        { method: "GET", path: "/products", handlers: ["getProducts"], middleware: [] },
      ]);
    });
  });

  describe("Arrays of paths", () => {
    it("should expand array of paths into separate route objects", () => {
      const app = express();
      function healthCheck(req: any, res: any) {}

      app.get(["/health", "/status", "/ping"], healthCheck);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        { method: "GET", path: "/health", handlers: ["healthCheck"], middleware: [] },
        { method: "GET", path: "/status", handlers: ["healthCheck"], middleware: [] },
        { method: "GET", path: "/ping", handlers: ["healthCheck"], middleware: [] },
      ]);
    });

    it("should preserve HTTP method and middleware for each expanded path in array", () => {
      const app = express();
      function auth(req: any, res: any, next: any) {
        next();
      }
      function handler(req: any, res: any) {}

      app.post(["/v1/submit", "/v2/submit"], auth, handler);

      const routes = scanRoutes(app);

      expect(routes).toEqual([
        {
          method: "POST",
          path: "/v1/submit",
          handlers: ["handler"],
          middleware: ["auth"],
        },
        {
          method: "POST",
          path: "/v2/submit",
          handlers: ["handler"],
          middleware: ["auth"],
        },
      ]);
    });
  });
});
