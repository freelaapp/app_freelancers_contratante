import React from "react";
import { render, screen } from "@testing-library/react-native";
import { InfoBox } from "@/components/info-box";

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
    textSecondary: "#687076",
  },
  fontSizes: { xs: 10, base: 13 },
  fontWeights: { regular: "400", bold: "700" },
  radii: { lg: 12 },
  spacing: { "2": 4, "5": 10, "7": 14 },
}));

describe("InfoBox", () => {
  it("renderiza sem crash", () => {
    render(
      <InfoBox
        icon="information-circle-outline"
        title="Atenção"
        body="Leia com cuidado antes de continuar."
      />
    );
  });

  it("exibe o título", () => {
    render(
      <InfoBox icon="information-circle-outline" title="Atenção" body="Descrição" />
    );
    expect(screen.getByText("Atenção")).toBeTruthy();
  });

  it("exibe o corpo do texto", () => {
    render(
      <InfoBox
        icon="information-circle-outline"
        title="Atenção"
        body="Leia com cuidado antes de continuar."
      />
    );
    expect(screen.getByText("Leia com cuidado antes de continuar.")).toBeTruthy();
  });

  it("exibe o ícone correto", () => {
    render(
      <InfoBox icon="alert-circle-outline" title="Aviso" body="Conteúdo do aviso." />
    );
    expect(screen.getByTestId("icon-alert-circle-outline")).toBeTruthy();
  });

  it("exibe ícones diferentes conforme a prop icon", () => {
    render(
      <InfoBox icon="checkmark-circle-outline" title="Sucesso" body="Operação concluída." />
    );
    expect(screen.getByTestId("icon-checkmark-circle-outline")).toBeTruthy();
  });
});
