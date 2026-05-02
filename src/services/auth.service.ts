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

  uploadAvatar: async (uri: string): Promise<string> => {
    const filename = uri.split("/").pop() ?? "avatar.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    const type = mimeMap[ext] ?? "image/jpeg";

    const formData = new FormData();
    formData.append("file", { uri, name: filename, type } as unknown as Blob);

    const res = await api.post<{ url: string }>("/v1/uploads/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  },

  updateProfile: (payload: { name?: string; avatarUrl?: string }): Promise<AxiosResponse<UserProfile>> =>
    api.put("/v1/users/profile", payload),
};
