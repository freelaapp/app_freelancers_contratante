// Armazenamento em memória — funciona no Expo Go sem módulos nativos
// Substituir por expo-secure-store quando fizer dev build (npx expo run:ios)
let _token: string | null = null;

export const tokenStore = {
  async get(): Promise<string | null> {
    return _token;
  },
  async set(token: string): Promise<void> {
    _token = token;
  },
  async clear(): Promise<void> {
    _token = null;
  },
};
