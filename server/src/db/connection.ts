import { Pool } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Database configuration - Neon DB connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create Neon Pool connection
const pool = new Pool({ connectionString });

// Create drizzle instance with Neon Pool
export const db = drizzle(pool, { schema });

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1 as test");
    client.release();
    console.log("✅ Neon database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Neon database connection failed:", error);
    return false;
  }
};
