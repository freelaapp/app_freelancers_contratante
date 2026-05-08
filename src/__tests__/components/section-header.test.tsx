import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { SectionHeader } from "@/components/section-header";

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
  },
  fontSizes: { md: 14, xl: 18 },
  fontWeights: { bold: "700" },
  spacing: { "1": 2, "3": 6 },
}));

describe("SectionHeader", () => {
  it("renderiza sem crash", () => {
    render(<SectionHeader title="Vagas" icon="calendar-outline" />);
  });

  it("exibe o título", () => {
    render(<SectionHeader title="Vagas recentes" icon="calendar-outline" />);
    expect(screen.getByText("Vagas recentes")).toBeTruthy();
  });

  it("exibe o ícone correto", () => {
    render(<SectionHeader title="Vagas" icon="star-outline" />);
    expect(screen.getByTestId("icon-star-outline")).toBeTruthy();
  });

  it("não exibe o botão 'Ver todos' quando onViewAll não é fornecido", () => {
    render(<SectionHeader title="Vagas" icon="calendar-outline" />);
    expect(screen.queryByText("Ver todos")).toBeNull();
  });

  it("exibe o botão 'Ver todos' quando onViewAll é fornecido", () => {
    render(
      <SectionHeader
        title="Vagas"
        icon="calendar-outline"
        onViewAll={jest.fn()}
      />
    );
    expect(screen.getByText("Ver todos")).toBeTruthy();
  });

  it("chama onViewAll ao pressionar 'Ver todos'", () => {
    const onViewAll = jest.fn();
    render(
      <SectionHeader title="Vagas" icon="calendar-outline" onViewAll={onViewAll} />
    );
    fireEvent.press(screen.getByText("Ver todos"));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it("exibe ícone de chevron junto ao 'Ver todos'", () => {
    render(
      <SectionHeader
        title="Vagas"
        icon="calendar-outline"
        onViewAll={jest.fn()}
      />
    );
    expect(screen.getByTestId("icon-chevron-forward")).toBeTruthy();
  });
});
