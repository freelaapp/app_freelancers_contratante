import React from "react";
import { render, screen } from "@testing-library/react-native";
import { AvaliacaoCard } from "@/components/avaliacao-card";

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
    primary: "#F5A623",
    ink: "#11181C",
    muted: "#9CA3AF",
    textSecondary: "#687076",
    border: "#E5E7EB",
  },
  fontSizes: { xs: 10, base: 13, md: 14 },
  fontWeights: { regular: "400", bold: "700" },
  spacing: {
    "1": 2,
    "3": 6,
    "4": 8,
    "8": 16,
  },
}));

const DEFAULT_PROPS = {
  nome: "Carlos Silva",
  data: "12/04/2026",
  estrelas: 4,
  comentario: "Ótimo serviço, muito pontual.",
};

describe("AvaliacaoCard", () => {
  it("renderiza sem crash", () => {
    render(<AvaliacaoCard {...DEFAULT_PROPS} />);
  });

  it("exibe o nome do avaliador", () => {
    render(<AvaliacaoCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("Carlos Silva")).toBeTruthy();
  });

  it("exibe a data da avaliação", () => {
    render(<AvaliacaoCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("12/04/2026")).toBeTruthy();
  });

  it("exibe o comentário entre aspas", () => {
    render(<AvaliacaoCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('"Ótimo serviço, muito pontual."')).toBeTruthy();
  });

  it("exibe o Divider quando showDivider é true (padrão)", () => {
    const { UNSAFE_getAllByType } = render(<AvaliacaoCard {...DEFAULT_PROPS} />);
    const views = UNSAFE_getAllByType(require("react-native").View);
    expect(views.length).toBeGreaterThan(0);
  });

  it("renderiza sem Divider quando showDivider é false", () => {
    render(<AvaliacaoCard {...DEFAULT_PROPS} showDivider={false} />);
    expect(screen.getByText("Carlos Silva")).toBeTruthy();
  });

  it("exibe ícone de chevron-down", () => {
    render(<AvaliacaoCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId("icon-chevron-down")).toBeTruthy();
  });
});
