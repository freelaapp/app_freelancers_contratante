import React from "react";
import { Text, View } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { CardContainer } from "@/components/card-container";

jest.mock("@/constants/theme", () => ({
  radii: { "2xl": 20 },
  spacing: { "6": 12, "8": 16 },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
}));

describe("CardContainer", () => {
  it("renderiza sem crash", () => {
    render(
      <CardContainer>
        <Text>Conteúdo</Text>
      </CardContainer>
    );
  });

  it("exibe o conteúdo filho", () => {
    render(
      <CardContainer>
        <Text>Texto interno</Text>
      </CardContainer>
    );
    expect(screen.getByText("Texto interno")).toBeTruthy();
  });

  it("exibe múltiplos filhos", () => {
    render(
      <CardContainer>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </CardContainer>
    );
    expect(screen.getByText("Item 1")).toBeTruthy();
    expect(screen.getByText("Item 2")).toBeTruthy();
    expect(screen.getByText("Item 3")).toBeTruthy();
  });

  it("aceita style customizado via prop style", () => {
    const customStyle = { margin: 10 };
    const { UNSAFE_getByType } = render(
      <CardContainer style={customStyle}>
        <Text>Conteúdo</Text>
      </CardContainer>
    );
    const view = UNSAFE_getByType(View);
    const hasCustomStyle = view.props.style.some(
      (s: Record<string, unknown>) =>
        s && typeof s === "object" && s.margin === 10
    );
    expect(hasCustomStyle).toBe(true);
  });

  it("renderiza sem filhos sem crash", () => {
    render(<CardContainer>{null}</CardContainer>);
  });
});
