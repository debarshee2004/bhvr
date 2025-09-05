import { swaggerUI } from "@hono/swagger-ui";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
import { swaggerDoc } from "./config/swagger";
import { testConnection } from "./db/connection";
import authRoutes from "./routes/auth";

const app = new Hono();

// Test database connection on startup
testConnection();

// Middleware
app.use(cors());

// Swagger UI
app.get("/api-docs", swaggerUI({ url: "/api-docs/json" }));
app.get("/api-docs/json", (c) => c.json(swaggerDoc));

// Routes
app.route("/auth", authRoutes);

app.get("/", (c) => {
  const response: ApiResponse = {
    message:
      "Welcome to BHVR Authentication API! Visit /api-docs for documentation.",
    success: true,
  };
  return c.json(response);
});

app.get("/hello", async (c) => {
  const data: ApiResponse = {
    message: "Hello BHVR!",
    success: true,
  };

  return c.json(data, { status: 200 });
});

export default app;
