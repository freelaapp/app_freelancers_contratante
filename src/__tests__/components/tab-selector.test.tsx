import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { TabSelector } from "@/components/tab-selector";

jest.mock("@/constants/theme", () => ({
  colors: {
    primary: "#F5A623",
    inkButton: "#1C1005",
    textSecondary: "#687076",
    borderLight: "#F3F4F6",
  },
  fontSizes: { base: 13 },
  fontWeights: { medium: "500", bold: "700" },
  radii: { lg: 12 },
  spacing: { "2": 4 },
}));

const OPTIONS = [
  { label: "Ativas", value: "ativas" },
  { label: "Concluídas", value: "concluidas" },
  { label: "Canceladas", value: "canceladas" },
];

describe("TabSelector", () => {
  it("renderiza sem crash", () => {
    render(
      <TabSelector options={OPTIONS} value="ativas" onChange={jest.fn()} />
    );
  });

  it("exibe todos os labels das tabs", () => {
    render(
      <TabSelector options={OPTIONS} value="ativas" onChange={jest.fn()} />
    );
    expect(screen.getByText("Ativas")).toBeTruthy();
    expect(screen.getByText("Concluídas")).toBeTruthy();
    expect(screen.getByText("Canceladas")).toBeTruthy();
  });

  it("chama onChange com o valor correto ao pressionar uma tab", () => {
    const onChange = jest.fn();
    render(<TabSelector options={OPTIONS} value="ativas" onChange={onChange} />);
    fireEvent.press(screen.getByText("Concluídas"));
    expect(onChange).toHaveBeenCalledWith("concluidas");
  });

  it("chama onChange ao pressionar a tab já ativa", () => {
    const onChange = jest.fn();
    render(<TabSelector options={OPTIONS} value="ativas" onChange={onChange} />);
    fireEvent.press(screen.getByText("Ativas"));
    expect(onChange).toHaveBeenCalledWith("ativas");
  });

  it("chama onChange com 'canceladas' ao pressionar a última tab", () => {
    const onChange = jest.fn();
    render(<TabSelector options={OPTIONS} value="ativas" onChange={onChange} />);
    fireEvent.press(screen.getByText("Canceladas"));
    expect(onChange).toHaveBeenCalledWith("canceladas");
  });

  it("renderiza com apenas uma opção sem crash", () => {
    render(
      <TabSelector
        options={[{ label: "Única", value: "unica" }]}
        value="unica"
        onChange={jest.fn()}
      />
    );
    expect(screen.getByText("Única")).toBeTruthy();
  });

  it("renderiza lista vazia sem crash", () => {
    render(<TabSelector options={[]} value="" onChange={jest.fn()} />);
  });
});
