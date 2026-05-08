import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { BottomActionBar } from "@/components/bottom-action-bar";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));

jest.mock("@/constants/theme", () => ({
  colors: {
    background: "#F5F5F0",
    border: "#E5E7EB",
  },
  spacing: { "6": 12, "8": 16 },
}));

describe("BottomActionBar", () => {
  it("renderiza sem crash", () => {
    render(
      <BottomActionBar>
        <Text>Ação</Text>
      </BottomActionBar>
    );
  });

  it("exibe o conteúdo filho", () => {
    render(
      <BottomActionBar>
        <Text>Confirmar pedido</Text>
      </BottomActionBar>
    );
    expect(screen.getByText("Confirmar pedido")).toBeTruthy();
  });

  it("exibe múltiplos filhos", () => {
    render(
      <BottomActionBar>
        <Text>Botão 1</Text>
        <Text>Botão 2</Text>
      </BottomActionBar>
    );
    expect(screen.getByText("Botão 1")).toBeTruthy();
    expect(screen.getByText("Botão 2")).toBeTruthy();
  });

  it("aplica backgroundColor customizado quando fornecido", () => {
    const { UNSAFE_getByType } = render(
      <BottomActionBar backgroundColor="#FF0000">
        <Text>Ação</Text>
      </BottomActionBar>
    );
    const view = UNSAFE_getByType(require("react-native").View);
    const flatStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.backgroundColor === "#FF0000"
    );
    expect(flatStyle).toBeTruthy();
  });

  it("aplica borderTopWidth 1 quando showTopBorder é true", () => {
    const { UNSAFE_getByType } = render(
      <BottomActionBar showTopBorder>
        <Text>Ação</Text>
      </BottomActionBar>
    );
    const view = UNSAFE_getByType(require("react-native").View);
    const borderStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.borderTopWidth === 1
    );
    expect(borderStyle).toBeTruthy();
  });

  it("aplica borderTopWidth 0 quando showTopBorder é false (padrão)", () => {
    const { UNSAFE_getByType } = render(
      <BottomActionBar>
        <Text>Ação</Text>
      </BottomActionBar>
    );
    const view = UNSAFE_getByType(require("react-native").View);
    const borderStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.borderTopWidth === 0
    );
    expect(borderStyle).toBeTruthy();
  });
});
