import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { VagaCard } from "@/components/vaga-card";

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
    ink: "#11181C",
    textSecondary: "#687076",
    border: "#E5E7EB",
    primary: "#F5A623",
    muted: "#9CA3AF",
  },
  fontSizes: { xs: 10, base: 13, lg: 16 },
  fontWeights: { regular: "400", semibold: "600", bold: "700" },
  radii: { full: 9999, xl: 15 },
  spacing: { "2": 4, "4": 8, "5": 10, "8": 16 },
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
  title: "Barman para casamento",
  location: "Campinas, SP",
  date: "15/06/2026",
  time: "20:00",
  value: "R$ 400,00",
  status: "aberta" as const,
};

describe("VagaCard", () => {
  it("renderiza sem crash", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
  });

  it("exibe o título da vaga", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("Barman para casamento")).toBeTruthy();
  });

  it("exibe a localização", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("Campinas, SP")).toBeTruthy();
  });

  it("exibe a data", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("15/06/2026")).toBeTruthy();
  });

  it("exibe o horário", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("20:00")).toBeTruthy();
  });

  it("exibe o valor", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("R$ 400,00")).toBeTruthy();
  });

  it("exibe badge com label 'Aberta' para status aberta", () => {
    render(<VagaCard {...DEFAULT_PROPS} status="aberta" />);
    expect(screen.getByText("Aberta")).toBeTruthy();
  });

  it("exibe badge com label 'Preenchida' para status preenchida", () => {
    render(<VagaCard {...DEFAULT_PROPS} status="preenchida" />);
    expect(screen.getByText("Preenchida")).toBeTruthy();
  });

  it("exibe badge com label 'Concluída' para status concluida", () => {
    render(<VagaCard {...DEFAULT_PROPS} status="concluida" />);
    expect(screen.getByText("Concluída")).toBeTruthy();
  });

  it("exibe badge com label 'Em andamento' para status em_andamento", () => {
    render(<VagaCard {...DEFAULT_PROPS} status="em_andamento" />);
    expect(screen.getByText("Em andamento")).toBeTruthy();
  });

  it("chama onPress ao pressionar o card", () => {
    const onPress = jest.fn();
    render(<VagaCard {...DEFAULT_PROPS} onPress={onPress} />);
    fireEvent.press(screen.getByText("Barman para casamento"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("não lança erro quando onPress não é fornecido", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
    expect(() => {
      fireEvent.press(screen.getByText("Barman para casamento"));
    }).not.toThrow();
  });

  it("exibe ícones de calendário e relógio", () => {
    render(<VagaCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId("icon-calendar-outline")).toBeTruthy();
    expect(screen.getByTestId("icon-time-outline")).toBeTruthy();
  });
});
