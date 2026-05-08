import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { ServiceChip } from "@/components/service-chip";

jest.mock("@/constants/theme", () => ({
  colors: {
    ink: "#11181C",
    primary: "#F5A623",
  },
  fontSizes: { sm: 11 },
  fontWeights: { medium: "500" },
  spacing: { "4": 8, "5": 10, "6": 12 },
}));

describe("ServiceChip", () => {
  const DEFAULT_PROPS = {
    emoji: "🍕",
    label: "Alimentação",
    selected: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza sem crash", () => {
    render(<ServiceChip {...DEFAULT_PROPS} />);
  });

  it("exibe o emoji", () => {
    render(<ServiceChip {...DEFAULT_PROPS} />);
    expect(screen.getByText("🍕")).toBeTruthy();
  });

  it("exibe o label", () => {
    render(<ServiceChip {...DEFAULT_PROPS} />);
    expect(screen.getByText("Alimentação")).toBeTruthy();
  });

  it("chama onPress ao pressionar o chip", () => {
    const onPress = jest.fn();
    render(<ServiceChip {...DEFAULT_PROPS} onPress={onPress} />);
    fireEvent.press(screen.getByText("Alimentação"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renderiza no estado selecionado sem crash", () => {
    render(<ServiceChip {...DEFAULT_PROPS} selected />);
    expect(screen.getByText("Alimentação")).toBeTruthy();
  });

  it("renderiza no estado não selecionado sem crash", () => {
    render(<ServiceChip {...DEFAULT_PROPS} selected={false} />);
    expect(screen.getByText("Alimentação")).toBeTruthy();
  });

  it("exibe emoji e label diferentes quando props são alteradas", () => {
    render(
      <ServiceChip
        emoji="🎵"
        label="Música"
        selected={false}
        onPress={jest.fn()}
      />
    );
    expect(screen.getByText("🎵")).toBeTruthy();
    expect(screen.getByText("Música")).toBeTruthy();
  });
});
