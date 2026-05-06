import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";
import CriarVagaScreen from "@/app/(home)/criar-vaga";

Object.defineProperty(Platform, "OS", { get: () => "android" });

jest.mock("@react-native-community/datetimepicker", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: View,
    DateTimePickerAndroid: { open: jest.fn() },
  };
});

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useRouter: () => jest.requireMock("expo-router").router,
  Stack: { Screen: () => null },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children }: { children: unknown }) =>
      require("react").createElement(View, null, children),
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("@/context/auth-context", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: {
      id: "user-1",
      name: "Empresa Teste",
      email: "empresa@teste.com",
      profileCompleted: true,
      userType: "contractor",
      module: "bars-restaurants",
      contractorId: "contractor-123",
      avatarUrl: null,
    },
  }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

jest.mock("@/components/steps-criar-vaga", () => ({
  MultiStepCriarVaga: () => null,
}));

describe("CriarVagaScreen", () => {
  it("renderiza componente MultiStepCriarVaga", () => {
    render(<CriarVagaScreen />);
    expect(screen.toJSON()).toBeNull();
  });
});