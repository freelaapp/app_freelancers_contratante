import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import PoliticaDePrivacidadeScreen from "@/app/(home)/politica-de-privacidade";

const mockRouterBack = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockRouterBack,
    replace: mockRouterReplace,
    canGoBack: () => true,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("PoliticaDePrivacidadeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza sem crash (smoke test)", () => {
    render(<PoliticaDePrivacidadeScreen />);
    expect(screen.getByText("Política de Privacidade")).toBeTruthy();
  });

  it("exibe o titulo da tela no header", () => {
    render(<PoliticaDePrivacidadeScreen />);
    expect(screen.getByText("Política de Privacidade")).toBeTruthy();
  });

  it("exibe a data de vigencia no card", () => {
    render(<PoliticaDePrivacidadeScreen />);
    expect(screen.getByText(/01 de janeiro de 2025/)).toBeTruthy();
  });

  it("exibe referencia a LGPD no cabecalho do card", () => {
    render(<PoliticaDePrivacidadeScreen />);
    const lgpdMatches = screen.getAllByText(/LGPD/);
    expect(lgpdMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("exibe secoes de conteudo", () => {
    render(<PoliticaDePrivacidadeScreen />);
    expect(screen.getByText("Introdução")).toBeTruthy();
    expect(screen.getByText("1. Dados Coletados")).toBeTruthy();
    expect(screen.getByText("5. Seus Direitos (LGPD)")).toBeTruthy();
    expect(screen.getByText("11. Contato e Encarregado (DPO)")).toBeTruthy();
  });

  it("exibe o rodape da tela", () => {
    render(<PoliticaDePrivacidadeScreen />);
    expect(
      screen.getByText("Freela Serviços © 2025 · Todos os direitos reservados")
    ).toBeTruthy();
  });

  it("chama router.back ao pressionar o botao de voltar (canGoBack true)", () => {
    render(<PoliticaDePrivacidadeScreen />);
    fireEvent.press(screen.getByTestId("back-button"));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it("chama router.replace com o fallback quando canGoBack retorna false", () => {
    mockRouterReplace.mockClear();
    mockRouterBack.mockClear();

    jest
      .spyOn(require("expo-router"), "useRouter")
      .mockReturnValue({
        back: mockRouterBack,
        replace: mockRouterReplace,
        canGoBack: () => false,
      });

    render(<PoliticaDePrivacidadeScreen />);
    fireEvent.press(screen.getByTestId("back-button"));

    expect(mockRouterReplace).toHaveBeenCalledWith("/(home)/configuracoes");
    expect(mockRouterBack).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
