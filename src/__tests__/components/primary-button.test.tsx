import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { PrimaryButton } from "@/components/primary-button";

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children }: { children: React.ReactNode }) =>
      require("react").createElement(View, null, children),
  };
});

jest.mock("@/constants/theme", () => ({
  colors: {
    inkButton: "#1C1005",
    overlayButtonShade: "rgba(120, 70, 0, 0.30)",
  },
  fontSizes: { xl: 18 },
  fontWeights: { bold: "700" },
  radii: { xl: 15 },
  gradients: {
    button: {
      colors: ["#F5A623", "#D4891A"],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  },
}));

describe("PrimaryButton", () => {
  it("renderiza sem crash", () => {
    render(<PrimaryButton label="Confirmar" />);
  });

  it("exibe o label fornecido", () => {
    render(<PrimaryButton label="Confirmar" />);
    expect(screen.getByText(/Confirmar/)).toBeTruthy();
  });

  it("exibe o ícone padrão '+' quando não fornecido", () => {
    render(<PrimaryButton label="Enviar" />);
    expect(screen.getByText(/\+/)).toBeTruthy();
  });

  it("exibe ícone customizado quando fornecido", () => {
    render(<PrimaryButton label="Salvar" icon="★" />);
    expect(screen.getByText(/★/)).toBeTruthy();
  });

  it("chama onPress ao pressionar o botão", () => {
    const onPress = jest.fn();
    render(<PrimaryButton label="Confirmar" onPress={onPress} />);
    fireEvent.press(screen.getByText(/Confirmar/));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("não chama onPress quando disabled é true", () => {
    const onPress = jest.fn();
    render(<PrimaryButton label="Confirmar" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText(/Confirmar/));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("exibe ActivityIndicator quando loading é true", () => {
    render(<PrimaryButton label="Carregando" loading />);
    expect(screen.getByTestId("primary-button-loading")).toBeTruthy();
  });

  it("não exibe label quando loading é true", () => {
    render(<PrimaryButton label="Carregando" loading />);
    expect(screen.queryByText(/Carregando/)).toBeNull();
  });

  it("não chama onPress quando loading é true", () => {
    const onPress = jest.fn();
    render(<PrimaryButton label="Carregando" onPress={onPress} loading />);
    fireEvent.press(screen.getByTestId("primary-button-loading"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
