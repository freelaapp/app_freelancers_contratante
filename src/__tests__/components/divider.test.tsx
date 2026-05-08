import React from "react";
import { render } from "@testing-library/react-native";
import { Divider } from "@/components/divider";

jest.mock("@/constants/theme", () => ({
  colors: { border: "#E5E7EB" },
  spacing: { "4": 8 },
}));

describe("Divider", () => {
  it("renderiza sem crash (horizontal padrão)", () => {
    render(<Divider />);
  });

  it("renderiza sem crash no modo vertical", () => {
    render(<Divider orientation="vertical" />);
  });

  it("aplica backgroundColor padrão do tema", () => {
    const { UNSAFE_getByType } = render(<Divider />);
    const view = UNSAFE_getByType(require("react-native").View);
    const bgStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.backgroundColor === "#E5E7EB"
    );
    expect(bgStyle).toBeTruthy();
  });

  it("aplica cor customizada quando fornecida", () => {
    const { UNSAFE_getByType } = render(<Divider color="#FF0000" />);
    const view = UNSAFE_getByType(require("react-native").View);
    const bgStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.backgroundColor === "#FF0000"
    );
    expect(bgStyle).toBeTruthy();
  });

  it("aplica marginHorizontal quando fornecido no modo horizontal", () => {
    const { UNSAFE_getByType } = render(<Divider marginHorizontal={16} />);
    const view = UNSAFE_getByType(require("react-native").View);
    const marginStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.marginHorizontal === 16
    );
    expect(marginStyle).toBeTruthy();
  });

  it("aplica height customizado no modo vertical", () => {
    const { UNSAFE_getByType } = render(
      <Divider orientation="vertical" height={50} />
    );
    const view = UNSAFE_getByType(require("react-native").View);
    const heightStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.height === 50
    );
    expect(heightStyle).toBeTruthy();
  });

  it("usa height padrão de 32 quando vertical sem height fornecido", () => {
    const { UNSAFE_getByType } = render(<Divider orientation="vertical" />);
    const view = UNSAFE_getByType(require("react-native").View);
    const heightStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.height === 32
    );
    expect(heightStyle).toBeTruthy();
  });
});
