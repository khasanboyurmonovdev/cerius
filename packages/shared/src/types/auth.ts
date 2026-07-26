import type { User } from './user.js';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

/** User as returned to clients — never carries credentials or soft-delete flags. */
export type PublicUser = Omit<User, 'isDeleted' | 'deletedAt'>;

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
  isNewUser?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
