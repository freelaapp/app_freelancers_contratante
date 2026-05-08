import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { PageHeader } from "@/components/page-header";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  const { createElement } = require("react");
  return {
    Ionicons: ({ name, testID }: { name: string; testID?: string }) =>
      createElement(View, { testID: testID ?? `icon-${name}` }),
  };
});

jest.mock("@/utils/navigation", () => ({
  goBackOrReplace: jest.fn(),
}));

jest.mock("@/constants/theme", () => ({
  colors: {
    background: "#F5F5F0",
    ink: "#11181C",
    muted: "#9CA3AF",
    textSecondary: "#687076",
  },
  fontSizes: { base: 13, md: 14, "2xl": 22 },
  fontWeights: { regular: "400", bold: "700" },
  radii: { full: 9999, "3xl": 28 },
  spacing: {
    "1": 2,
    "8": 16,
    "10": 20,
    "12": 24,
    "16": 32,
  },
}));

describe("PageHeader", () => {
  it("renderiza sem crash", () => {
    render(<PageHeader title="Minha tela" />);
  });

  it("exibe o título", () => {
    render(<PageHeader title="Configurações" />);
    expect(screen.getByText("Configurações")).toBeTruthy();
  });

  it("exibe badge quando fornecido", () => {
    render(<PageHeader title="Perfil" badge="NOVO" />);
    expect(screen.getByText("NOVO")).toBeTruthy();
  });

  it("não exibe badge quando não fornecido", () => {
    render(<PageHeader title="Perfil" />);
    expect(screen.queryByText("NOVO")).toBeNull();
  });

  it("exibe subtitle quando fornecido", () => {
    render(<PageHeader title="Perfil" subtitle="Gerencie seus dados" />);
    expect(screen.getByText("Gerencie seus dados")).toBeTruthy();
  });

  it("não exibe subtitle quando não fornecido", () => {
    render(<PageHeader title="Perfil" />);
    expect(screen.queryByText("Gerencie seus dados")).toBeNull();
  });

  it("chama onBack personalizado ao pressionar o botão de voltar", () => {
    const onBack = jest.fn();
    render(<PageHeader title="Perfil" onBack={onBack} />);
    fireEvent.press(screen.getByTestId("icon-arrow-back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("chama goBackOrReplace quando onBack não é fornecido", () => {
    const { goBackOrReplace } = require("@/utils/navigation");
    render(<PageHeader title="Perfil" />);
    fireEvent.press(screen.getByTestId("icon-arrow-back"));
    expect(goBackOrReplace).toHaveBeenCalledTimes(1);
  });

  it("renderiza no modo inline quando inline é true", () => {
    render(<PageHeader title="Detalhe" inline />);
    expect(screen.getByText("Detalhe")).toBeTruthy();
  });

  it("exibe ícone de voltar no modo inline", () => {
    render(<PageHeader title="Detalhe" inline />);
    expect(screen.getByTestId("icon-arrow-back")).toBeTruthy();
  });
});
