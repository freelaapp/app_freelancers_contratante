import axios, { AxiosError } from "axios";
import { tokenStore } from "./token-store";
import { toast } from "@/utils/toast";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.freelaservicosapp.com.br";

export const api = axios.create({
  baseURL: BASE_URL,
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

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export function unregisterUnauthorizedHandler(): void {
  onUnauthorized = null;
}

const ERROR_MESSAGES: Record<number, string> = {
  400: "Dados inválidos. Verifique as informações.",
  403: "Você não tem permissão para esta ação.",
  404: "Recurso não encontrado.",
  409: "Este registro já existe.",
  422: "Operação não permitida.",
  429: "Muitas tentativas. Tente novamente em breve.",
  500: "Erro interno do servidor. Tente novamente.",
};

type ApiErrorData = {
  message?: string | string[];
  error?: string;
  errors?: string[] | Record<string, string[]>;
};

function extractApiMessage(data: ApiErrorData | undefined): string | undefined {
  if (!data) return undefined;

  if (typeof data.message === "string" && data.message) return data.message;

  if (Array.isArray(data.message) && data.message.length > 0) {
    return data.message[0];
  }

  if (typeof data.error === "string" && data.error) return data.error;

  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors[0];

  if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first.length > 0) return first[0];
  }

  return undefined;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorData>) => {
    const status = error.response?.status;

    console.log("[API ERROR]", {
      url: error.config?.url,
      method: error.config?.method,
      status,
      requestData: error.config?.data,
      responseData: error.response?.data,
    });

    if (status === 401) {
      await tokenStore.clear();
      onUnauthorized?.();
      return Promise.reject(error);
    }

    const apiMessage = extractApiMessage(error.response?.data);
    const fallbackMessage = status ? ERROR_MESSAGES[status] : undefined;
    const message = apiMessage ?? fallbackMessage ?? "Ocorreu um erro inesperado.";

    toast.error(message);

    return Promise.reject(error);
  }
);
