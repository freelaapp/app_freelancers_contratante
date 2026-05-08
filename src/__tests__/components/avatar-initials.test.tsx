import React from "react";
import { render, screen } from "@testing-library/react-native";
import { AvatarInitials } from "@/components/avatar-initials";

jest.mock("@/constants/theme", () => ({
  colors: {
    primary: "#F5A623",
    white: "#FFFFFF",
  },
  fontWeights: { bold: "700" },
}));

describe("AvatarInitials", () => {
  it("renderiza sem crash com initials", () => {
    render(<AvatarInitials initials="TM" />);
  });

  it("exibe as iniciais fornecidas", () => {
    render(<AvatarInitials initials="TM" />);
    expect(screen.getByText("TM")).toBeTruthy();
  });

  it("exibe iniciais de uma única letra", () => {
    render(<AvatarInitials initials="A" />);
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("renderiza Image quando imageUrl é fornecido", () => {
    const { UNSAFE_getAllByType } = render(
      <AvatarInitials initials="TM" imageUrl="https://example.com/avatar.jpg" />
    );
    const images = UNSAFE_getAllByType(require("react-native").Image);
    expect(images.length).toBeGreaterThan(0);
  });

  it("não exibe iniciais quando imageUrl é fornecido", () => {
    render(
      <AvatarInitials initials="TM" imageUrl="https://example.com/avatar.jpg" />
    );
    expect(screen.queryByText("TM")).toBeNull();
  });

  it("renderiza View com initials quando imageUrl é null", () => {
    render(<AvatarInitials initials="AB" imageUrl={null} />);
    expect(screen.getByText("AB")).toBeTruthy();
  });

  it("aplica tamanho customizado via prop size", () => {
    const { UNSAFE_getByType } = render(
      <AvatarInitials initials="TM" size={80} />
    );
    const view = UNSAFE_getByType(require("react-native").View);
    const sizedStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.width === 80
    );
    expect(sizedStyle).toBeTruthy();
  });

  it("aplica backgroundColor customizado quando fornecido", () => {
    const { UNSAFE_getByType } = render(
      <AvatarInitials initials="TM" backgroundColor="#FF0000" />
    );
    const view = UNSAFE_getByType(require("react-native").View);
    const bgStyle = view.props.style.find(
      (s: Record<string, unknown>) => s && typeof s === "object" && s.backgroundColor === "#FF0000"
    );
    expect(bgStyle).toBeTruthy();
  });
});
