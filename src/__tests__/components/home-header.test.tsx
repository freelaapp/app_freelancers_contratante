import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { HomeHeader } from "@/components/home-header";

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children }: { children: React.ReactNode }) =>
      require("react").createElement(View, null, children),
  };
});

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

jest.mock("@/constants/theme", () => ({
  colors: {
    dark: "#1A1A2E",
    darkMuted: "rgba(26, 26, 46, 0.70)",
    error: "#EF4444",
    overlayWhite: "rgba(255, 255, 255, 0.25)",
    overlayDarkCard: "rgba(0, 0, 0, 0.12)",
  },
  fontSizes: { xs: 10, base: 13, lg: 16, xl: 18 },
  fontWeights: { regular: "400", bold: "700" },
  radii: { full: 9999, lg: 12 },
  spacing: { "1": 2, "2": 4, "4": 8, "6": 12, "8": 16, "10": 20 },
  gradients: {
    primary: {
      colors: ["#ECA826", "#F2C94C"],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  },
}));

jest.mock("../../assets/images/icon.png", () => "icon-mock", { virtual: true });

const DEFAULT_PROPS = {
  userName: "Thiago",
};

describe("HomeHeader", () => {
  it("renderiza sem crash", () => {
    render(<HomeHeader {...DEFAULT_PROPS} />);
  });

  it("exibe a saudação 'Olá,'", () => {
    render(<HomeHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("Olá,")).toBeTruthy();
  });

  it("exibe o nome do usuário", () => {
    render(<HomeHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("Thiago")).toBeTruthy();
  });

  it("exibe valor de saldo padrão quando não fornecido", () => {
    render(<HomeHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("R$2.830")).toBeTruthy();
  });

  it("exibe saldo customizado quando fornecido", () => {
    render(<HomeHeader {...DEFAULT_PROPS} saldo="R$5.000" />);
    expect(screen.getByText("R$5.000")).toBeTruthy();
  });

  it("exibe número de vagas padrão", () => {
    render(<HomeHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("exibe avaliação padrão", () => {
    render(<HomeHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("4.9")).toBeTruthy();
  });

  it("exibe os labels das estatísticas", () => {
    render(<HomeHeader {...DEFAULT_PROPS} />);
    expect(screen.getByText("Gastos do mês")).toBeTruthy();
    expect(screen.getByText("Vagas")).toBeTruthy();
    expect(screen.getByText("Avaliação")).toBeTruthy();
  });

  it("chama onChat ao pressionar o botão de chat", () => {
    const onChat = jest.fn();
    render(<HomeHeader {...DEFAULT_PROPS} onChat={onChat} />);
    fireEvent.press(screen.getByTestId("icon-chatbubble-outline"));
    expect(onChat).toHaveBeenCalledTimes(1);
  });

  it("chama onNotifications ao pressionar o botão de notificações", () => {
    const onNotifications = jest.fn();
    render(
      <HomeHeader {...DEFAULT_PROPS} onNotifications={onNotifications} />
    );
    fireEvent.press(
      screen.getByTestId("header-notifications-button")
    );
    expect(onNotifications).toHaveBeenCalledTimes(1);
  });

  it("chama onHelp ao pressionar o botão de ajuda", () => {
    const onHelp = jest.fn();
    render(<HomeHeader {...DEFAULT_PROPS} onHelp={onHelp} />);
    fireEvent.press(screen.getByTestId("icon-logo-whatsapp"));
    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  it("não exibe badge de notificação quando hasNotifications é false", () => {
    const { queryByTestId } = render(
      <HomeHeader {...DEFAULT_PROPS} hasNotifications={false} />
    );
    expect(queryByTestId("notification-badge")).toBeNull();
  });
});
