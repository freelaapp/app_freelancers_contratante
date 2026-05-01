import { AxiosResponse } from "axios";
import { api } from "./api";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    emailConfirmed: boolean;
    userType: "provider" | "contractor" | null;
  };
  onboarding: {
    isPending: boolean;
    nextStep: string | null;
  };
};

export type UserProfile = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  cityId: string | null;
  emailConfirmed: boolean;
};

export const authService = {
  login: (email: string, password: string): Promise<AxiosResponse<LoginResponse>> =>
    api.post("/v1/users/login", { email, password }),

  getProfile: (): Promise<AxiosResponse<UserProfile>> =>
    api.get("/v1/users/profile"),
};
