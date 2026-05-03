import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import CriarVagaScreen from "@/app/(home)/criar-vaga";

// ─── Mocks de navegação ────────────────────────────────────────────────────────

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useRouter: () => jest.requireMock("expo-router").router,
  Stack: { Screen: () => null },
}));

// ─── Mock safe area ────────────────────────────────────────────────────────────

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ─── Mock LinearGradient ───────────────────────────────────────────────────────

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children }: { children: unknown }) =>
      require("react").createElement(View, null, children),
  };
});

// ─── Mock icons ───────────────────────────────────────────────────────────────

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

// ─── Mock auth context ────────────────────────────────────────────────────────

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

// ─── Mock vagas service ───────────────────────────────────────────────────────

const mockCreate = jest.fn().mockResolvedValue({ id: "vaga-1", title: "Barista" });

jest.mock("@/services/vagas.service", () => ({
  vagasService: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

// ─── Mock toast ───────────────────────────────────────────────────────────────

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("@/utils/toast", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// ─── Mock react-native-toast-message ──────────────────────────────────────────

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fillValidForm() {
  fireEvent.press(screen.getByText("Barista"));
  fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "20/06/2026");
  fireEvent.changeText(screen.getByPlaceholderText("HH:MM", { selector: undefined }), "18:00");
  const allHHMM = screen.getAllByPlaceholderText("HH:MM");
  fireEvent.changeText(allHHMM[0], "18:00");
  fireEvent.changeText(allHHMM[1], "23:00");
  fireEvent.changeText(
    screen.getByPlaceholderText(/Preciso de 2 garçons/),
    "Evento corporativo no sábado, traje social exigido."
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({ id: "vaga-1", title: "Barista" });
});

describe("CriarVagaScreen", () => {
  it("renderiza título Nova contratação", () => {
    render(<CriarVagaScreen />);
    expect(screen.getByText("Nova contratação")).toBeTruthy();
  });

  it("renderiza chips de serviços", () => {
    render(<CriarVagaScreen />);
    expect(screen.getByText("Barista")).toBeTruthy();
    expect(screen.getByText("Barman/Bartender")).toBeTruthy();
    expect(screen.getByText("Garçom/Garçonete")).toBeTruthy();
  });

  it("selecionar chip marca o chip como selecionado", () => {
    render(<CriarVagaScreen />);
    const chip = screen.getByText("Barista");
    fireEvent.press(chip);
    expect(chip).toBeTruthy();
  });

  it("renderiza campo de data do evento", () => {
    render(<CriarVagaScreen />);
    expect(screen.getByPlaceholderText("dd/mm/aaaa")).toBeTruthy();
  });

  it("renderiza campos de horário de início e fim", () => {
    render(<CriarVagaScreen />);
    const horarioFields = screen.getAllByPlaceholderText("HH:MM");
    expect(horarioFields).toHaveLength(2);
  });

  it("campo de endereço fica visível quando switch No estabelecimento está OFF", () => {
    render(<CriarVagaScreen />);
    const switchEl = screen.getByRole("switch");
    fireEvent(switchEl, "valueChange", false);
    expect(screen.getByPlaceholderText("Rua, número, bairro...")).toBeTruthy();
  });

  it("campo de endereço fica oculto quando switch No estabelecimento está ON", () => {
    render(<CriarVagaScreen />);
    expect(screen.queryByPlaceholderText("Rua, número, bairro...")).toBeNull();
  });

  it("submeter sem selecionar serviço exibe erro de validação", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText(/Publicar contratação/));
    await waitFor(() => {
      expect(screen.getByText("Selecione ao menos um serviço")).toBeTruthy();
    });
  });

  it("submeter com data em formato inválido exibe erro", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "2026-06-20");
    fireEvent.press(screen.getByText(/Publicar contratação/));
    await waitFor(() => {
      expect(screen.getByText("Use o formato DD/MM/AAAA")).toBeTruthy();
    });
  });

  it("submeter com horário em formato inválido exibe erro", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "20/06/2026");
    const horarioFields = screen.getAllByPlaceholderText("HH:MM");
    fireEvent.changeText(horarioFields[0], "1800");
    fireEvent.press(screen.getByText(/Publicar contratação/));
    await waitFor(() => {
      expect(screen.getByText("Use o formato HH:MM")).toBeTruthy();
    });
  });

  it("submeter sem endereço quando switch está OFF exibe erro de campo obrigatório", async () => {
    render(<CriarVagaScreen />);
    const switchEl = screen.getByRole("switch");
    fireEvent(switchEl, "valueChange", false);
    fireEvent.press(screen.getByText("Barista"));
    fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "20/06/2026");
    const horarioFields = screen.getAllByPlaceholderText("HH:MM");
    fireEvent.changeText(horarioFields[0], "18:00");
    fireEvent.changeText(horarioFields[1], "23:00");
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
    fireEvent.press(screen.getByText(/Publicar contratação/));
    await waitFor(() => {
      expect(screen.getByText("Endereço é obrigatório")).toBeTruthy();
    });
  });

  it("submeter form válido chama vagasService.create com payload correto", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "20/06/2026");
    const horarioFields = screen.getAllByPlaceholderText("HH:MM");
    fireEvent.changeText(horarioFields[0], "18:00");
    fireEvent.changeText(horarioFields[1], "23:00");
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
    await act(async () => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
    const [module, payload] = mockCreate.mock.calls[0];
    expect(module).toBe("bars-restaurants");
    expect(payload.serviceType).toBe("Barista");
    expect(payload.date).toBe("2026-06-20");
    expect(payload.startTime).toBe("2026-06-20T18:00:00.000Z");
    expect(payload.endTime).toBe("2026-06-20T23:00:00.000Z");
  });

  it("após sucesso chama toast.success e router.back", async () => {
    const routerMock = jest.requireMock("expo-router");
    render(<CriarVagaScreen />);

    fireEvent.press(screen.getByText("Barista"));
    fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "20/06/2026");

    const horarioFields = screen.getAllByPlaceholderText("HH:MM");
    fireEvent.changeText(horarioFields[0], "18:00");
    fireEvent.changeText(horarioFields[1], "23:00");

    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );

    await act(async () => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("Vaga publicada com sucesso!");
      expect(routerMock.router.back).toHaveBeenCalled();
    });
  });

  it("exibe indicador de loading enquanto a vaga é criada", async () => {
    let resolveCreate!: (value: unknown) => void;
    mockCreate.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      })
    );
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "20/06/2026");
    const horarioFields = screen.getAllByPlaceholderText("HH:MM");
    fireEvent.changeText(horarioFields[0], "18:00");
    fireEvent.changeText(horarioFields[1], "23:00");
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
    act(() => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });
    await waitFor(() => {
      expect(screen.getByTestId("primary-button-loading")).toBeTruthy();
    });
    await act(async () => {
      resolveCreate({ id: "vaga-1", title: "Barista" });
    });
  });

  it("erro na API exibe toast.error", async () => {
    mockCreate.mockRejectedValue(new Error("network error"));
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    fireEvent.changeText(screen.getByPlaceholderText("dd/mm/aaaa"), "20/06/2026");
    const horarioFields = screen.getAllByPlaceholderText("HH:MM");
    fireEvent.changeText(horarioFields[0], "18:00");
    fireEvent.changeText(horarioFields[1], "23:00");
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
    await act(async () => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Erro ao publicar a vaga. Tente novamente."
      );
    });
  });
});
