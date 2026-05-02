import * as SecureStore from "expo-secure-store";

const KEYS = {
  accessToken: "auth_access_token",
  refreshToken: "auth_refresh_token",
  user: "auth_user",
} as const;

export const tokenStore = {
  get: async (): Promise<string | null> => SecureStore.getItemAsync(KEYS.accessToken),

  set: async (accessToken: string, refreshToken: string): Promise<void> => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.accessToken, accessToken),
      SecureStore.setItemAsync(KEYS.refreshToken, refreshToken),
    ]);
  },

  getRefresh: async (): Promise<string | null> => SecureStore.getItemAsync(KEYS.refreshToken),

  clear: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.accessToken),
      SecureStore.deleteItemAsync(KEYS.refreshToken),
      SecureStore.deleteItemAsync(KEYS.user),
    ]);
  },

  setUser: async (user: object): Promise<void> => {
    await SecureStore.setItemAsync(KEYS.user, JSON.stringify(user));
  },

  getUser: async <T>(): Promise<T | null> => {
    const raw = await SecureStore.getItemAsync(KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};
