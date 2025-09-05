import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import type { UserResponse } from "shared/dist";
import type { User } from "../db/schema";

// In a real app, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const SALT_ROUNDS = 10;

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: UserResponse): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  static extractUserResponse(user: User): UserResponse {
    const { password, ...userResponse } = user;
    return userResponse;
  }
}
