import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";
import AjudaScreen from "@/app/(home)/ajuda";

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

jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

const FAQ_QUESTIONS = [
  "Como criar uma vaga?",
  "Como funciona o pagamento?",
  "Como avaliar um freelancer?",
  "Posso cancelar um evento?",
  "Como aceitar ou recusar candidatos?",
  "O que e uma proposta exclusiva?",
];

describe("AjudaScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza a tela corretamente (smoke test)", () => {
    render(<AjudaScreen />);
    expect(screen.getByText("Ajuda")).toBeTruthy();
    expect(screen.getByText("Ainda precisa de ajuda?")).toBeTruthy();
    expect(screen.getByTestId("support-button")).toBeTruthy();
  });

  it("renderiza os 6 itens do FAQ", () => {
    render(<AjudaScreen />);
    for (let id = 1; id <= 6; id++) {
      expect(screen.getByTestId(`faq-item-${id}`)).toBeTruthy();
    }
  });

  it("expande um item ao pressionar e exibe a resposta", () => {
    render(<AjudaScreen />);

    expect(screen.queryByTestId("faq-answer-1")).toBeNull();

    fireEvent.press(screen.getByTestId("faq-item-1"));

    expect(screen.getByTestId("faq-answer-1")).toBeTruthy();
  });

  it("fecha o primeiro item ao abrir o segundo (single-expand)", () => {
    render(<AjudaScreen />);

    fireEvent.press(screen.getByTestId("faq-item-1"));
    expect(screen.getByTestId("faq-answer-1")).toBeTruthy();
    expect(screen.queryByTestId("faq-answer-2")).toBeNull();

    fireEvent.press(screen.getByTestId("faq-item-2"));
    expect(screen.queryByTestId("faq-answer-1")).toBeNull();
    expect(screen.getByTestId("faq-answer-2")).toBeTruthy();
  });

  it("fecha o item ao pressionar ele novamente", () => {
    render(<AjudaScreen />);

    fireEvent.press(screen.getByTestId("faq-item-3"));
    expect(screen.getByTestId("faq-answer-3")).toBeTruthy();

    fireEvent.press(screen.getByTestId("faq-item-3"));
    expect(screen.queryByTestId("faq-answer-3")).toBeNull();
  });

  it("chama Linking.openURL com a URL do WhatsApp ao pressionar Chamar Suporte", () => {
    render(<AjudaScreen />);

    fireEvent.press(screen.getByTestId("support-button"));

    expect(Linking.openURL).toHaveBeenCalledWith("https://wa.me/5511999999999");
    expect(Linking.openURL).toHaveBeenCalledTimes(1);
  });

  it("chama router.back ao pressionar o botao de voltar", () => {
    render(<AjudaScreen />);

    fireEvent.press(screen.getByTestId("back-button"));

    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
});
