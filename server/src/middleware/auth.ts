import type { Context, MiddlewareHandler, Next } from "hono";
import { AuthUtils, type JWTPayload } from "../utils/auth";

declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

export const authMiddleware: MiddlewareHandler = async (
  c: Context,
  next: Next
) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          message: "Authorization header is required",
          success: false,
        },
        401
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded: JWTPayload = AuthUtils.verifyToken(token);
      c.set("user", decoded);
      await next();
    } catch (error) {
      return c.json(
        {
          message: "Invalid or expired token",
          success: false,
        },
        401
      );
    }
  } catch (error) {
    return c.json(
      {
        message: "Authentication failed",
        success: false,
      },
      500
    );
  }
};
