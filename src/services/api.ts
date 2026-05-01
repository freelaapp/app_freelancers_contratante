import axios, { AxiosError } from "axios";
import { Alert } from "react-native";
import { tokenStore } from "./token-store";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<{ error?: { code?: string; message?: string } }>) => {
    if (error.response?.status === 401) {
      await tokenStore.clear();
    }

    // Só mostra Alert para erros com resposta da API (4xx/5xx), não para falhas de rede
    const apiMessage = error.response?.data?.error?.message;
    if (apiMessage) {
      Alert.alert("Erro", apiMessage);
    }

    return Promise.reject(error);
  }
);
