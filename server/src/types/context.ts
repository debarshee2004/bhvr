import type { Context } from "hono";
import type { JWTPayload } from "../utils/auth";

export interface AuthContext extends Context {
  get(key: "user"): JWTPayload;
  set(key: "user", value: JWTPayload): void;
}
