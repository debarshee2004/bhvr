import axios from "axios";
import type {
  ApiResponse,
  SigninRequest,
  SignupRequest,
  UserResponse,
} from "shared/dist";

// API base URL - update this to match your backend
const API_BASE_URL = "http://localhost:3000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export interface AuthService {
  signup: (data: SignupRequest) => Promise<ApiResponse>;
  signin: (data: SigninRequest) => Promise<ApiResponse>;
  logout: () => Promise<ApiResponse>;
  getCurrentUser: () => Promise<ApiResponse>;
}

export const authService: AuthService = {
  async signup(data: SignupRequest): Promise<ApiResponse> {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  async signin(data: SigninRequest): Promise<ApiResponse> {
    const response = await api.post("/auth/signin", data);
    return response.data;
  },

  async logout(): Promise<ApiResponse> {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Helper functions for token management
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem("authToken", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("authToken");
  },

  removeToken: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  setUser: (user: UserResponse) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser: (): UserResponse | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    const token = tokenManager.getToken();
    return !!token;
  },
};
