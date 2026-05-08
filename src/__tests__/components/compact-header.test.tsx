import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { CompactHeader } from "@/components/compact-header";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    canGoBack: () => true,
  }),
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
    dark: "#1A1A2E",
    overlayDark: "rgba(0, 0, 0, 0.08)",
  },
  fontSizes: { xl: 18, "2xl": 22 },
  fontWeights: { bold: "700" },
  radii: { md: 8 },
  spacing: {
    "4": 8,
    "6": 12,
    "10": 20,
  },
}));

jest.mock("../../assets/images/icon.png", () => "icon-mock", { virtual: true });

describe("CompactHeader", () => {
  it("renderiza sem crash", () => {
    render(<CompactHeader title="Cadastro" subtitle="Passo 1 de 3" />);
  });

  it("exibe o título", () => {
    render(<CompactHeader title="Criar conta" subtitle="Passo 1 de 3" />);
    expect(screen.getByText("Criar conta")).toBeTruthy();
  });

  it("exibe o subtítulo", () => {
    render(<CompactHeader title="Criar conta" subtitle="Informações pessoais" />);
    expect(screen.getByText("Informações pessoais")).toBeTruthy();
  });

  it("exibe ícone de voltar", () => {
    render(<CompactHeader title="Criar conta" subtitle="Passo 1" />);
    expect(screen.getByTestId("icon-arrow-back")).toBeTruthy();
  });

  it("chama onBack customizado ao pressionar o botão de voltar", () => {
    const onBack = jest.fn();
    render(
      <CompactHeader title="Criar conta" subtitle="Passo 1" onBack={onBack} />
    );
    fireEvent.press(screen.getByTestId("icon-arrow-back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("chama goBackOrReplace quando onBack não é fornecido e não é primeira tela", () => {
    const { goBackOrReplace } = require("@/utils/navigation");
    render(<CompactHeader title="Criar conta" subtitle="Passo 2" />);
    fireEvent.press(screen.getByTestId("icon-arrow-back"));
    expect(goBackOrReplace).toHaveBeenCalledTimes(1);
  });

  it("chama router.replace para login quando isFirstScreen é true e onBack não é fornecido", () => {
    const mockReplace = jest.fn();
    jest.spyOn(require("expo-router"), "useRouter").mockReturnValue({
      back: jest.fn(),
      replace: mockReplace,
      push: jest.fn(),
      canGoBack: () => false,
    });
    render(<CompactHeader title="Login" subtitle="Acesse sua conta" isFirstScreen />);
    fireEvent.press(screen.getByTestId("icon-arrow-back"));
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });
});
