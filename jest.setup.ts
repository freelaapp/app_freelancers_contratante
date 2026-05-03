// Matchers do @testing-library/react-native são registrados automaticamente via jest-expo preset

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
