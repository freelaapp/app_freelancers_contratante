import { api } from "@/services/api";
import type {
  RegisterPayload,
  LoginPayload,
  LoginResponse,
  ConfirmEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UserMe,
} from "@/types/api";

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post("/v1/users/register", payload),

  login: (payload: LoginPayload): Promise<{ data: LoginResponse }> =>
    api.post("/v1/users/login", payload),

  me: (): Promise<{ data: UserMe }> =>
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
