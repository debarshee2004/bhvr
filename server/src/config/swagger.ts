export const swaggerDoc = {
  openapi: "3.0.0",
  info: {
    title: "BHVR Authentication API",
    description: "A simple authentication API built with Hono and JWT",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
          success: {
            type: "boolean",
          },
          data: {
            type: "object",
          },
        },
        required: ["message", "success"],
      },
      UserResponse: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          email: {
            type: "string",
            format: "email",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
        required: ["id", "email", "createdAt"],
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: {
            $ref: "#/components/schemas/UserResponse",
          },
          token: {
            type: "string",
          },
        },
        required: ["user", "token"],
      },
      SignupRequest: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          password: {
            type: "string",
            minLength: 6,
          },
        },
        required: ["email", "password"],
      },
      SigninRequest: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          password: {
            type: "string",
          },
        },
        required: ["email", "password"],
      },
    },
  },
  tags: [
    {
      name: "Authentication",
      description: "Authentication related endpoints",
    },
  ],
};
