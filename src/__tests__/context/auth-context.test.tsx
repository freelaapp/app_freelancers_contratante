import React from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { tokenStore } from "@/services/token-store";

jest.mock("@/services/api", () => ({
  registerUnauthorizedHandler: jest.fn(),
  unregisterUnauthorizedHandler: jest.fn(),
}));

jest.mock("@/utils/toast", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

jest.mock("@/services/auth.service", () => ({
  authService: {
    login: jest.fn().mockResolvedValue({
      data: {
        accessToken: "fake-access-token",
        refreshToken: "fake-refresh-token",
        user: {
          id: "1",
          email: "usuario@freela.com",
          emailConfirmed: true,
          userType: "contractor",
        },
        onboarding: { isPending: false, nextStep: null },
        context: {
          modules: ["bars-restaurants"],
          profilesByModule: {
            "bars-restaurants": { contractorId: "contractor-1", role: "contractor" },
          },
        },
      },
    }),
    me: jest.fn().mockResolvedValue({
      data: {
        id: "1",
        name: "Usuário Teste",
        email: "usuario@freela.com",
        profileCompleted: true,
      },
    }),
  },
}));

beforeEach(async () => {
  await tokenStore.clear();
  jest.clearAllMocks();
});

function AuthConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useAuth>) => void }) {
  const ctx = useAuth();
  onRender(ctx);
  return <Text>{ctx.user?.email ?? "sem-usuario"}</Text>;
}

function renderWithAuth(onRender: (ctx: ReturnType<typeof useAuth>) => void) {
  return render(
    <AuthProvider>
      <AuthConsumer onRender={onRender} />
    </AuthProvider>
  );
}

describe("AuthProvider — estado inicial", () => {
  it("deve finalizar isInitializing após restaurar sessão sem token", async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => {
      expect(captured!.isInitializing).toBe(false);
    });

    expect(captured!.user).toBeNull();
  });

  it("deve restaurar sessão quando há token salvo", async () => {
    await tokenStore.set("fake-jwt-token", "fake-refresh-token");
    await tokenStore.setUser({ id: "1", email: "usuario@freela.com", contractorId: "contractor-1" });

    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => {
      expect(captured!.isInitializing).toBe(false);
      expect(captured!.user).not.toBeNull();
    });
  });
});

describe("AuthProvider — signIn", () => {
  it("deve definir usuário após signIn", async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => expect(captured!.isInitializing).toBe(false));

    await act(async () => {
      await captured!.signIn("usuario@freela.com", "senha123");
    });

    expect(captured!.user).not.toBeNull();
    expect(captured!.user?.email).toBe("usuario@freela.com");
  });

  it("deve salvar token no store após signIn", async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => expect(captured!.isInitializing).toBe(false));

    await act(async () => {
      await captured!.signIn("usuario@freela.com", "senha123");
    });

    const token = await tokenStore.get();
    expect(token).not.toBeNull();
  });

  it("deve ter isLoading false após signIn completar", async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => expect(captured!.isInitializing).toBe(false));

    await act(async () => {
      await captured!.signIn("usuario@freela.com", "senha123");
    });

    expect(captured!.isLoading).toBe(false);
  });
});

describe("AuthProvider — signOut", () => {
  it("deve remover usuário após signOut", async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => expect(captured!.isInitializing).toBe(false));

    await act(async () => { await captured!.signIn("usuario@freela.com", "senha123"); });
    await act(async () => { await captured!.signOut(); });

    expect(captured!.user).toBeNull();
  });

  it("deve limpar token do store após signOut", async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => expect(captured!.isInitializing).toBe(false));

    await act(async () => { await captured!.signIn("usuario@freela.com", "senha123"); });
    await act(async () => { await captured!.signOut(); });

    const token = await tokenStore.get();
    expect(token).toBeNull();
  });
});

describe("AuthProvider — completeProfile", () => {
  it("deve marcar profileCompleted como true", async () => {
    let captured: ReturnType<typeof useAuth> | null = null;
    renderWithAuth((ctx) => { captured = ctx; });

    await waitFor(() => expect(captured!.isInitializing).toBe(false));

    await act(async () => { await captured!.signIn("usuario@freela.com", "senha123"); });
    act(() => { captured!.completeProfile("bars-restaurants", "contractor-id-1"); });

    expect(captured!.user?.profileCompleted).toBe(true);
  });
});

describe("useAuth — fora do Provider", () => {
  it("deve lançar erro quando usado fora do AuthProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AuthConsumer onRender={() => {}} />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );
    spy.mockRestore();
  });
});
