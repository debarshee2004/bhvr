import { Hono } from "hono";
import type {
  ApiResponse,
  AuthResponse,
  SigninRequest,
  SignupRequest,
} from "shared/dist";

import { userService } from "../db";
import { authMiddleware } from "../middleware/auth";
import { AuthUtils } from "../utils/auth";

const auth = new Hono();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: User already exists
 */
auth.post("/signup", async (c) => {
  try {
    const body: SignupRequest = await c.req.json();

    // Basic validation
    if (!body.email || !body.password) {
      const response: ApiResponse = {
        message: "Email and password are required",
        success: false,
      };
      return c.json(response, 400);
    }

    if (body.password.length < 6) {
      const response: ApiResponse = {
        message: "Password must be at least 6 characters long",
        success: false,
      };
      return c.json(response, 400);
    }

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(body.email);
    if (existingUser) {
      const response: ApiResponse = {
        message: "User already exists with this email",
        success: false,
      };
      return c.json(response, 409);
    }

    // Hash password and create user
    const hashedPassword = await AuthUtils.hashPassword(body.password);
    const user = await userService.createUser({
      email: body.email,
      password: hashedPassword,
    });

    // Generate token and prepare response
    const userResponse = AuthUtils.extractUserResponse(user);
    const token = AuthUtils.generateToken(userResponse);

    const authResponse: AuthResponse = {
      user: userResponse,
      token,
    };

    const response: ApiResponse = {
      message: "User created successfully",
      success: true,
      data: authResponse,
    };

    return c.json(response, 201);
  } catch (error) {
    const response: ApiResponse = {
      message: "Internal server error",
      success: false,
    };
    return c.json(response, 500);
  }
});

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Sign in to an existing account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Invalid credentials
 */
auth.post("/signin", async (c) => {
  try {
    const body: SigninRequest = await c.req.json();

    // Basic validation
    if (!body.email || !body.password) {
      const response: ApiResponse = {
        message: "Email and password are required",
        success: false,
      };
      return c.json(response, 400);
    }

    // Find user by email
    const user = await userService.findUserByEmail(body.email);
    if (!user) {
      const response: ApiResponse = {
        message: "Invalid email or password",
        success: false,
      };
      return c.json(response, 401);
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(
      body.password,
      user.password
    );
    if (!isPasswordValid) {
      const response: ApiResponse = {
        message: "Invalid email or password",
        success: false,
      };
      return c.json(response, 401);
    }

    // Generate token and prepare response
    const userResponse = AuthUtils.extractUserResponse(user);
    const token = AuthUtils.generateToken(userResponse);

    const authResponse: AuthResponse = {
      user: userResponse,
      token,
    };

    const response: ApiResponse = {
      message: "Sign in successful",
      success: true,
      data: authResponse,
    };

    return c.json(response, 200);
  } catch (error) {
    const response: ApiResponse = {
      message: "Internal server error",
      success: false,
    };
    return c.json(response, 500);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from the current session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized - invalid token
 */
auth.post("/logout", authMiddleware, async (c) => {
  // In a stateless JWT system, logout is typically handled on the client side
  // by removing the token. For more security, you could maintain a blacklist
  // of revoked tokens in your database.

  const response: ApiResponse = {
    message: "Logout successful",
    success: true,
  };

  return c.json(response, 200);
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized - invalid token
 */
auth.get("/me", authMiddleware, async (c) => {
  try {
    const user = c.get("user");

    // Fetch fresh user data from database
    const userData = await userService.findUserById(user.id);
    if (!userData) {
      const response: ApiResponse = {
        message: "User not found",
        success: false,
      };
      return c.json(response, 404);
    }

    const userResponse = AuthUtils.extractUserResponse(userData);

    const response: ApiResponse = {
      message: "User information retrieved successfully",
      success: true,
      data: userResponse,
    };

    return c.json(response, 200);
  } catch (error) {
    const response: ApiResponse = {
      message: "Internal server error",
      success: false,
    };
    return c.json(response, 500);
  }
});

export default auth;
