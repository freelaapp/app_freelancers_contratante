import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "@/components/input";

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
    muted: "#9CA3AF",
    ink: "#11181C",
    surface: "#F9FAFB",
    border: "#E5E7EB",
    error: "#EF4444",
  },
  fontSizes: { md: 14, xs: 10 },
  fontWeights: { semibold: "600" },
  radii: { lg: 12 },
  spacing: { "3": 6, "5": 10, "7": 14 },
}));

describe("Input", () => {
  it("não deve exibir label quando prop label não é fornecida", () => {
    const { queryByText } = render(<Input placeholder="Digite algo" />);
    expect(queryByText(/Label/i)).toBeNull();
  });

  it("deve exibir o texto da label quando prop label é fornecida", () => {
    const { getByText } = render(<Input label="E-mail" />);
    expect(getByText("E-mail")).toBeTruthy();
  });

  it("não deve exibir mensagem de erro quando prop error não é fornecida", () => {
    const { queryByText } = render(<Input label="Campo" />);
    expect(queryByText("Campo obrigatório")).toBeNull();
  });

  it("deve exibir a mensagem de erro quando prop error é fornecida", () => {
    const { getByText } = render(<Input error="Campo obrigatório" />);
    expect(getByText("Campo obrigatório")).toBeTruthy();
  });

  it("deve ocultar o texto quando secureTextEntry é true", () => {
    const { getByDisplayValue } = render(
      <Input secureTextEntry defaultValue="minhasenha" />
    );
    const input = getByDisplayValue("minhasenha");
    expect(input.props.secureTextEntry).toBe(true);
  });

  it("deve exibir ícone de olho quando secureTextEntry é true", () => {
    const { getByTestId } = render(<Input secureTextEntry />);
    expect(getByTestId("icon-eye-outline")).toBeTruthy();
  });

  it("deve alternar a visibilidade da senha ao pressionar o botão de toggle", () => {
    const { getByDisplayValue, getByTestId } = render(
      <Input secureTextEntry defaultValue="minhasenha" />
    );

    const input = getByDisplayValue("minhasenha");
    expect(input.props.secureTextEntry).toBe(true);

    const iconElement = getByTestId("icon-eye-outline");
    fireEvent.press(iconElement.parent!);

    const inputAfterToggle = getByDisplayValue("minhasenha");
    expect(inputAfterToggle.props.secureTextEntry).toBe(false);
  });

  it("deve chamar onChangeText ao digitar no input", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Digite aqui" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText("Digite aqui"), "novo texto");
    expect(onChangeText).toHaveBeenCalledWith("novo texto");
  });
});
