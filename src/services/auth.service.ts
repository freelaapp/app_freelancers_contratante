import { api } from "@/services/api";
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  ConfirmEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UserProfile,
} from "@/types/api";

export const authService = {
  register: (payload: RegisterPayload): Promise<{ data: RegisterResponse }> =>
    api.post("/v1/users/register", payload),

  login: (payload: LoginPayload): Promise<{ data: LoginResponse }> =>
    api.post("/v1/users/login", payload),

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
