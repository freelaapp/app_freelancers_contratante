import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AxiosError } from "axios";
import LoginScreen from "@/app/(auth)/login";

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockSignIn = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("@/context/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      isLoading: false,
    });
  });

  it("exibe mensagem amigavel quando login retorna 401", async () => {
    const unauthorizedError = new AxiosError(
      "Unauthorized",
      "401",
      undefined,
      undefined,
      {
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: { headers: {} } as any,
        data: {},
      }
    );

    mockSignIn.mockRejectedValueOnce(unauthorizedError);

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Digite seu e-mail"), "maria@email.com");
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "12345678");
    fireEvent.press(screen.getByText("Entrar →"));

    await waitFor(() => {
      expect(
        screen.getByText("E-mail ou senha inválidos. Tente novamente.")
      ).toBeTruthy();
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
