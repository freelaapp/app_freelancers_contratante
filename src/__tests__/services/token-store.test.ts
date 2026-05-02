import { tokenStore } from "@/services/token-store";

describe("tokenStore", () => {
  beforeEach(async () => {
    await tokenStore.clear();
  });

  it("deve retornar null quando não há token salvo", async () => {
    const token = await tokenStore.get();
    expect(token).toBeNull();
  });

  it("deve salvar e recuperar o token corretamente", async () => {
    await tokenStore.set("meu-jwt-token", "refresh-token");
    const token = await tokenStore.get();
    expect(token).toBe("meu-jwt-token");
  });

  it("deve sobrescrever o token ao chamar set novamente", async () => {
    await tokenStore.set("token-antigo", "refresh-antigo");
    await tokenStore.set("token-novo", "refresh-novo");
    const token = await tokenStore.get();
    expect(token).toBe("token-novo");
  });

  it("deve retornar null após limpar o token", async () => {
    await tokenStore.set("qualquer-token", "qualquer-refresh");
    await tokenStore.clear();
    const token = await tokenStore.get();
    expect(token).toBeNull();
  });

  it("deve aceitar clear sem token salvo sem lançar erro", async () => {
    await expect(tokenStore.clear()).resolves.not.toThrow();
  });
});
