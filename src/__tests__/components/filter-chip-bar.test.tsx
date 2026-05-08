import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { FilterChipBar } from "@/components/filter-chip-bar";

jest.mock("@/constants/theme", () => ({
  colors: {
    background: "#F5F5F0",
    white: "#FFFFFF",
    ink: "#11181C",
    primary: "#F5A623",
    border: "#E5E7EB",
  },
  fontSizes: { base: 13 },
  fontWeights: { medium: "500", semibold: "600" },
  radii: { full: 9999 },
  spacing: { "4": 8, "6": 12, "8": 16, "10": 20 },
}));

const OPTIONS = [
  { id: "todos", label: "Todos" },
  { id: "aberta", label: "Aberta" },
  { id: "concluida", label: "Concluída" },
];

describe("FilterChipBar", () => {
  it("renderiza sem crash", () => {
    render(
      <FilterChipBar options={OPTIONS} activeId="todos" onSelect={jest.fn()} />
    );
  });

  it("exibe todos os chips", () => {
    render(
      <FilterChipBar options={OPTIONS} activeId="todos" onSelect={jest.fn()} />
    );
    expect(screen.getByText("Todos")).toBeTruthy();
    expect(screen.getByText("Aberta")).toBeTruthy();
    expect(screen.getByText("Concluída")).toBeTruthy();
  });

  it("chama onSelect com o id correto ao pressionar um chip", () => {
    const onSelect = jest.fn();
    render(
      <FilterChipBar options={OPTIONS} activeId="todos" onSelect={onSelect} />
    );
    fireEvent.press(screen.getByText("Aberta"));
    expect(onSelect).toHaveBeenCalledWith("aberta");
  });

  it("chama onSelect ao pressionar o chip ativo", () => {
    const onSelect = jest.fn();
    render(
      <FilterChipBar options={OPTIONS} activeId="todos" onSelect={onSelect} />
    );
    fireEvent.press(screen.getByText("Todos"));
    expect(onSelect).toHaveBeenCalledWith("todos");
  });

  it("renderiza lista vazia sem crash", () => {
    render(<FilterChipBar options={[]} activeId="" onSelect={jest.fn()} />);
  });

  it("exibe apenas um chip quando há somente uma opção", () => {
    render(
      <FilterChipBar
        options={[{ id: "unico", label: "Único" }]}
        activeId="unico"
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText("Único")).toBeTruthy();
  });
});
