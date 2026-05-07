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
  Link: () => null,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      name: "Test User",
      email: "test@test.com",
      profileCompleted: true,
      module: "bars-restaurants",
      contractorId: "contractor-1",
      avatarUrl: null,
    },
    isLoading: false,
    isInitializing: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    completeProfile: jest.fn(),
    updateAvatar: jest.fn(),
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