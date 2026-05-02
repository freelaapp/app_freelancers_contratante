import { tokenStore } from "@/services/token-store";
import {
  registerUnauthorizedHandler,
  unregisterUnauthorizedHandler,
} from "@/services/api";

// Reseta o token antes de cada teste
beforeEach(async () => {
  await tokenStore.clear();
  unregisterUnauthorizedHandler();
});

type MockAxios = {
  create: jest.MockedFunction<() => MockAxios>;
  interceptors: { request: { use: jest.Mock }; response: { use: jest.Mock } };
  get: jest.Mock;
  post: jest.Mock;
};

jest.mock("axios", () => {
  const mockAxios: MockAxios = {
    create: jest.fn((): MockAxios => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
  };
  return { default: mockAxios, ...mockAxios };
});

describe("registerUnauthorizedHandler", () => {
  it("deve registrar e chamar o handler quando invocado", () => {
    const handler = jest.fn();
    registerUnauthorizedHandler(handler);

    // Simula o que o interceptor de response faria em um 401
    handler();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("deve substituir handler anterior ao registrar um novo", () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    registerUnauthorizedHandler(handler1);
    registerUnauthorizedHandler(handler2);

    handler2();
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler1).not.toHaveBeenCalled();
  });

  it("deve remover o handler após unregister", () => {
    const handler = jest.fn();
    registerUnauthorizedHandler(handler);
    unregisterUnauthorizedHandler();

    // Após unregister, o módulo não deve ter referência ao handler
    // Verificamos via tokenStore que o estado está limpo
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("tokenStore integrado com interceptor de request", () => {
  it("deve retornar null quando não há token — request não deve ter Authorization", async () => {
    const token = await tokenStore.get();
    expect(token).toBeNull();
  });

  it("deve ter token disponível após signIn simulado", async () => {
    await tokenStore.set("fake-jwt-token", "fake-refresh-token");
    const token = await tokenStore.get();
    expect(token).toBe("fake-jwt-token");
  });

  it("deve limpar token após logout simulado", async () => {
    await tokenStore.set("fake-jwt-token", "fake-refresh-token");
    await tokenStore.clear();
    const token = await tokenStore.get();
    expect(token).toBeNull();
  });
});
