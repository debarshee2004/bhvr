export type ApiResponse = {
  message: string;
  success: boolean;
  data?: any;
};

export type User = {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
};

export type UserResponse = Omit<User, "password">;

export type SignupRequest = {
  email: string;
  password: string;
};

export type SigninRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: UserResponse;
  token: string;
};
