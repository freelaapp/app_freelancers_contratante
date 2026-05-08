import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { BookingCard } from "@/components/booking-card";

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
    white: "#FFFFFF",
    muted: "#9CA3AF",
    ink: "#11181C",
    primary: "#F5A623",
    textSecondary: "#687076",
    border: "#E5E7EB",
  },
  fontSizes: { xs: 10, base: 13, md: 14, lg: 16 },
  fontWeights: { regular: "400", semibold: "600", bold: "700" },
  radii: { full: 9999, "2xl": 20 },
  spacing: { "2": 4, "3": 6, "4": 8, "5": 10, "8": 16 },
  cardShadowStrong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusColors: {
    aberta: { bg: "#FEF3C7", text: "#92400E" },
    preenchida: { bg: "#DBEAFE", text: "#1D4ED8" },
    em_andamento: { bg: "#D1FAE5", text: "#065F46" },
    concluida: { bg: "#F3F4F6", text: "#6B7280" },
    cancelado: { bg: "#FEE2E2", text: "#991B1B" },
    aceito: { bg: "#DCFCE7", text: "#16A34A" },
    recusado: { bg: "#FEE2E2", text: "#DC2626" },
  },
}));

const DEFAULT_PROPS = {
  title: "Garçom para evento",
  location: "São Paulo, SP",
  date: "10/06/2026",
  time: "18:00",
  value: "R$ 250,00",
  status: "aberta" as const,
};

describe("BookingCard", () => {
  it("renderiza sem crash", () => {
    render(<BookingCard {...DEFAULT_PROPS} />);
  });

  it("exibe o título do card", () => {
    render(<BookingCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("Garçom para evento")).toBeTruthy();
  });

  it("exibe a localização", () => {
    render(<BookingCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("São Paulo, SP")).toBeTruthy();
  });

  it("exibe data e hora formatados com separador '·'", () => {
    render(<BookingCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("10/06/2026 · 18:00")).toBeTruthy();
  });

  it("exibe o valor", () => {
    render(<BookingCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("R$ 250,00")).toBeTruthy();
  });

  it("exibe badge com label correto para status aberta", () => {
    render(<BookingCard {...DEFAULT_PROPS} status="aberta" />);
    expect(screen.getByText("Aberta")).toBeTruthy();
  });

  it("exibe badge com label correto para status em_andamento", () => {
    render(<BookingCard {...DEFAULT_PROPS} status="em_andamento" />);
    expect(screen.getByText("Em andamento")).toBeTruthy();
  });

  it("exibe badge com label correto para status concluida", () => {
    render(<BookingCard {...DEFAULT_PROPS} status="concluida" />);
    expect(screen.getByText("Concluída")).toBeTruthy();
  });

  it("chama onPress ao pressionar o card", () => {
    const onPress = jest.fn();
    render(<BookingCard {...DEFAULT_PROPS} onPress={onPress} />);
    fireEvent.press(screen.getByText("Garçom para evento"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("não lança erro quando onPress não é fornecido", () => {
    render(<BookingCard {...DEFAULT_PROPS} />);
    expect(() => {
      fireEvent.press(screen.getByText("Garçom para evento"));
    }).not.toThrow();
  });

  it("exibe ícone de localização", () => {
    render(<BookingCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId("icon-location-outline")).toBeTruthy();
  });
});
