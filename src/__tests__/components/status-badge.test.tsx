import React from "react";
import { render, screen } from "@testing-library/react-native";
import { StatusBadge } from "@/components/status-badge";

jest.mock("@/constants/theme", () => ({
  fontSizes: { xs: 10 },
  fontWeights: { semibold: "600" },
  radii: { full: 9999 },
  spacing: { "5": 10, "2": 4 },
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

describe("StatusBadge", () => {
  it("renderiza sem crash", () => {
    render(<StatusBadge status="aberta" label="Aberta" />);
  });

  it("exibe o label fornecido", () => {
    render(<StatusBadge status="aberta" label="Aberta" />);
    expect(screen.getByText("Aberta")).toBeTruthy();
  });

  it("exibe label 'Preenchida' com status preenchida", () => {
    render(<StatusBadge status="preenchida" label="Preenchida" />);
    expect(screen.getByText("Preenchida")).toBeTruthy();
  });

  it("exibe label 'Em andamento' com status em_andamento", () => {
    render(<StatusBadge status="em_andamento" label="Em andamento" />);
    expect(screen.getByText("Em andamento")).toBeTruthy();
  });

  it("exibe label 'Concluída' com status concluida", () => {
    render(<StatusBadge status="concluida" label="Concluída" />);
    expect(screen.getByText("Concluída")).toBeTruthy();
  });

  it("aplica backgroundColor correto para status aberta", () => {
    const { UNSAFE_getByType } = render(<StatusBadge status="aberta" label="Aberta" />);
    const { View } = require("react-native");
    const badgeView = UNSAFE_getByType(View);
    const flatStyle = Array.isArray(badgeView.props.style)
      ? badgeView.props.style
      : [badgeView.props.style];
    const hasBg = flatStyle.some(
      (s: Record<string, unknown>) => s && s.backgroundColor === "#FEF3C7"
    );
    expect(hasBg).toBe(true);
  });

  it("aplica cor de texto correta para status aberta", () => {
    render(<StatusBadge status="aberta" label="Aberta" />);
    const label = screen.getByText("Aberta");
    const flatStyle = Array.isArray(label.props.style)
      ? label.props.style
      : [label.props.style];
    const hasColor = flatStyle.some(
      (s: Record<string, unknown>) => s && s.color === "#92400E"
    );
    expect(hasColor).toBe(true);
  });
});
