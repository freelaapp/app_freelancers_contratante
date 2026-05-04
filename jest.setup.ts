// Matchers do @testing-library/react-native são registrados automaticamente via jest-expo preset

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(null),
}));

const secureStoreData: Record<string, string> = {};

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => secureStoreData[key] ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    secureStoreData[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete secureStoreData[key];
  }),
}));

beforeEach(() => {
  Object.keys(secureStoreData).forEach((k) => delete secureStoreData[k]);
});
