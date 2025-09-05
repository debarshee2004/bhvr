import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { SigninRequest, SignupRequest, UserResponse } from "shared/dist";
import { authService, tokenManager } from "../services/api";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (
    data: SigninRequest
  ) => Promise<{ success: boolean; message: string }>;
  signup: (
    data: SignupRequest
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && tokenManager.isAuthenticated();

  useEffect(() => {
    // Check for existing token and user on app load
    const initAuth = async () => {
      const token = tokenManager.getToken();
      const savedUser = tokenManager.getUser();

      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          } else {
            // Token invalid, clear storage
            tokenManager.removeToken();
          }
        } catch (error) {
          // Token invalid, clear storage
          tokenManager.removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signin = async (
    data: SigninRequest
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.signin(data);

      if (response.success && response.data) {
        const { user, token } = response.data;
        tokenManager.setToken(token);
        tokenManager.setUser(user);
        setUser(user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Sign in failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    data: SignupRequest
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.signup(data);

      if (response.success && response.data) {
        const { user, token } = response.data;
        tokenManager.setToken(token);
        tokenManager.setUser(user);
        setUser(user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Sign up failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      tokenManager.removeToken();
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
        tokenManager.setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    signin,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
