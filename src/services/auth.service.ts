import { AxiosResponse } from "axios";
import { api } from "./api";
import type {
  RegisterPayload,
  RegisterResponse,
  LoginResponse,
  ConfirmEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UserProfile,
} from "@/types/api";

export const authService = {
  register: (payload: RegisterPayload): Promise<{ data: RegisterResponse }> =>
    api.post("/v1/users/register", payload),

  login: (email: string, password: string): Promise<AxiosResponse<LoginResponse>> =>
    api.post("/v1/users/login", { email, password }),

  getProfile: (): Promise<AxiosResponse<UserProfile>> =>
    api.get("/v1/users/profile"),

  me: (): Promise<{ data: UserProfile }> =>
    api.get("/v1/users/me"),

  confirmEmail: (payload: ConfirmEmailPayload) =>
    api.post("/v1/users/confirm-email", payload),

  resendConfirmationCode: (email: string) =>
    api.get(`/v1/users/generate-email-confirmation-code/${email}`),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post("/v1/users/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post("/v1/users/reset-password", payload),
};
