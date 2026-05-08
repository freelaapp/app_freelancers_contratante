import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { StarRating } from "@/components/star-rating";

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  const { createElement } = require("react");
  return {
    Ionicons: ({ name, testID }: { name: string; testID?: string }) =>
      createElement(View, { testID: testID ?? `icon-${name}` }),
  };
});

jest.mock("@/constants/theme", () => ({
  colors: { primary: "#F5A623" },
}));

// Mock do Pressable para expor o onPress e poder identificar cada item pelo índice
jest.mock("react-native/Libraries/Components/Pressable/Pressable", () => {
  const { TouchableOpacity } = require("react-native");
  return {
    __esModule: true,
    default: ({
      children,
      onPress,
      testID,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
      testID?: string;
    }) =>
      require("react").createElement(
        TouchableOpacity,
        { onPress, testID },
        children
      ),
  };
});

describe("StarRating", () => {
  it("renderiza sem crash", () => {
    render(<StarRating count={3} />);
  });

  it("renderiza sempre 5 estrelas", () => {
    const { getAllByTestId } = render(<StarRating count={3} />);
    const filled = getAllByTestId("icon-star");
    const empty = getAllByTestId("icon-star-outline");
    expect(filled.length + empty.length).toBe(5);
  });

  it("renderiza count estrelas preenchidas", () => {
    const { getAllByTestId } = render(<StarRating count={4} />);
    expect(getAllByTestId("icon-star").length).toBe(4);
    expect(getAllByTestId("icon-star-outline").length).toBe(1);
  });

  it("renderiza 0 estrelas preenchidas quando count é 0", () => {
    const { queryAllByTestId, getAllByTestId } = render(<StarRating count={0} />);
    expect(queryAllByTestId("icon-star").length).toBe(0);
    expect(getAllByTestId("icon-star-outline").length).toBe(5);
  });

  it("renderiza 5 estrelas preenchidas quando count é 5", () => {
    const { getAllByTestId, queryAllByTestId } = render(<StarRating count={5} />);
    expect(getAllByTestId("icon-star").length).toBe(5);
    expect(queryAllByTestId("icon-star-outline").length).toBe(0);
  });

  it("não renderiza TouchableOpacity quando interactive é false (padrão)", () => {
    const { UNSAFE_queryAllByType } = render(<StarRating count={3} />);
    const { TouchableOpacity } = require("react-native");
    const touchables = UNSAFE_queryAllByType(TouchableOpacity);
    expect(touchables.length).toBe(0);
  });

  it("chama onPress com valor 3 ao pressionar a 3ª estrela no modo interativo", () => {
    const onPress = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <StarRating count={2} interactive onPress={onPress} />
    );
    const { TouchableOpacity } = require("react-native");
    const items = UNSAFE_getAllByType(TouchableOpacity);
    expect(items.length).toBe(5);
    fireEvent.press(items[2]);
    expect(onPress).toHaveBeenCalledWith(3);
  });

  it("chama onPress com valor 1 ao pressionar a primeira estrela no modo interativo", () => {
    const onPress = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <StarRating count={0} interactive onPress={onPress} />
    );
    const { TouchableOpacity } = require("react-native");
    const items = UNSAFE_getAllByType(TouchableOpacity);
    expect(items.length).toBe(5);
    fireEvent.press(items[0]);
    expect(onPress).toHaveBeenCalledWith(1);
  });
});
