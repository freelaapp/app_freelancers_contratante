import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import TermosDeUsoScreen from "@/app/(home)/termos-de-uso";

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

describe("TermosDeUsoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza sem crash (smoke test)", () => {
    render(<TermosDeUsoScreen />);
    expect(screen.getByText("Termos de Uso")).toBeTruthy();
  });

  it("exibe o titulo da tela no header", () => {
    render(<TermosDeUsoScreen />);
    expect(screen.getByText("Termos de Uso")).toBeTruthy();
  });

  it("exibe a data de vigencia", () => {
    render(<TermosDeUsoScreen />);
    expect(screen.getByText(/01 de janeiro de 2025/)).toBeTruthy();
  });

  it("exibe secoes de conteudo", () => {
    render(<TermosDeUsoScreen />);
    expect(screen.getByText("Introdução")).toBeTruthy();
    expect(screen.getByText("1. Definições")).toBeTruthy();
    expect(screen.getByText("11. Disposições Gerais")).toBeTruthy();
  });

  it("exibe o rodape da tela", () => {
    render(<TermosDeUsoScreen />);
    expect(
      screen.getByText("Freela Serviços © 2025 · Todos os direitos reservados")
    ).toBeTruthy();
  });

  it("chama router.back ao pressionar o botao de voltar (canGoBack true)", () => {
    render(<TermosDeUsoScreen />);
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

    render(<TermosDeUsoScreen />);
    fireEvent.press(screen.getByTestId("back-button"));

    expect(mockRouterReplace).toHaveBeenCalledWith("/(home)/configuracoes");
    expect(mockRouterBack).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
