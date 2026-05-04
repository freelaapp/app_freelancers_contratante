import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
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

const { DateTimePickerAndroid } = jest.requireMock("@react-native-community/datetimepicker") as {
  DateTimePickerAndroid: { open: jest.Mock };
};

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
  Ionicons: () => null,
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

const mockCreate = jest.fn().mockResolvedValue({ id: "vaga-1", title: "Barista" });

jest.mock("@/services/vagas.service", () => ({
  vagasService: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("@/utils/toast", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

async function selectDate() {
  DateTimePickerAndroid.open.mockImplementationOnce(({ onChange }: { onChange: (e: unknown, date?: Date) => void }) => {
    onChange({}, new Date(2026, 5, 20));
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId("date-picker-button"));
  });
}

async function selectTime(testID: string, hours: number) {
  await act(async () => {
    fireEvent.changeText(
      screen.getByTestId(testID),
      String(hours).padStart(2, "0")
    );
  });
}

async function fillValidForm() {
  fireEvent.press(screen.getByText("Barista"));
  await selectDate();
  await selectTime("time-inicio-button", 17);
  await selectTime("time-fim-button", 23);
  fireEvent.changeText(
    screen.getByPlaceholderText(/Preciso de 2 garçons/),
    "Evento corporativo no sábado, traje social exigido."
  );
}

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

  it("renderiza botão de data do evento", () => {
    render(<CriarVagaScreen />);
    expect(screen.getByTestId("date-picker-button")).toBeTruthy();
  });

  it("campo de data exibe placeholder quando sem valor", () => {
    render(<CriarVagaScreen />);
    expect(screen.getByText("Selecione a data")).toBeTruthy();
  });

  it("ao selecionar data via picker, exibe o valor formatado no campo", async () => {
    render(<CriarVagaScreen />);
    await selectDate();
    expect(screen.getByText("20/06/2026")).toBeTruthy();
  });

  it("renderiza botões de horário de início e fim", () => {
    render(<CriarVagaScreen />);
    expect(screen.getByTestId("time-inicio-button")).toBeTruthy();
    expect(screen.getByTestId("time-fim-button")).toBeTruthy();
  });

  it("campos de horário exibem placeholder 00 quando sem valor", () => {
    render(<CriarVagaScreen />);
    const placeholders = screen.getAllByPlaceholderText("00");
    expect(placeholders).toHaveLength(2);
  });

  it("ao digitar horário de início, exibe o valor no campo", async () => {
    render(<CriarVagaScreen />);
    await selectTime("time-inicio-button", 18);
    expect(screen.getByDisplayValue("18")).toBeTruthy();
  });

  it("ao digitar horário de fim, exibe o valor no campo", async () => {
    render(<CriarVagaScreen />);
    await selectTime("time-fim-button", 23);
    expect(screen.getByDisplayValue("23")).toBeTruthy();
  });

  it("campo de endereço fica visível quando switch No estabelecimento está OFF", () => {
    render(<CriarVagaScreen />);
    const switchEl = screen.getByTestId("toggle-estabelecimento");
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

  it("submeter sem data exibe erro de campo obrigatório", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    fireEvent.press(screen.getByText(/Publicar contratação/));
    await waitFor(() => {
      expect(screen.getByText("Data do evento é obrigatória")).toBeTruthy();
    });
  });

  it("submeter sem horário exibe erro de campo obrigatório", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    await selectDate();
    fireEvent.press(screen.getByText(/Publicar contratação/));
    await waitFor(() => {
      expect(screen.getByText("Horário de início é obrigatório")).toBeTruthy();
    });
  });

  it("exibe erro quando horarioFim é igual ao horarioInicio", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    await selectDate();
    await selectTime("time-inicio-button", 18);
    await selectTime("time-fim-button", 18);
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
    await act(async () => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });
    await waitFor(() => {
      expect(screen.getByText("Horário de encerramento deve ser depois do início")).toBeTruthy();
    });
  });

  it("exibe erro quando horarioFim é antes do horarioInicio", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    await selectDate();
    await selectTime("time-inicio-button", 18);
    await selectTime("time-fim-button", 17);
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
    await act(async () => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });
    await waitFor(() => {
      expect(screen.getByText("Horário de encerramento deve ser depois do início")).toBeTruthy();
    });
  });

  it("submeter sem endereço quando switch está OFF exibe erro de campo obrigatório", async () => {
    render(<CriarVagaScreen />);
    const switchEl = screen.getByTestId("toggle-estabelecimento");
    fireEvent(switchEl, "valueChange", false);
    fireEvent.press(screen.getByText("Barista"));
    await selectDate();
    await selectTime("time-inicio-button", 18);
    await selectTime("time-fim-button", 23);
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
    await fillValidForm();
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
    expect(payload.startTime).toBe("2026-06-20T17:00:00.000Z");
    expect(payload.endTime).toBe("2026-06-20T23:00:00.000Z");
    expect(payload.contractorId).toBeUndefined();
  });

  it("após sucesso chama toast.success e router.back", async () => {
    const routerMock = jest.requireMock("expo-router");
    render(<CriarVagaScreen />);
    await fillValidForm();
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
    await fillValidForm();
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
    await fillValidForm();
    await act(async () => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Erro ao publicar a vaga. Tente novamente."
      );
    });
  });

  it("ao selecionar 1 servico exibe card de tarifa com valor hora e jornada minima", async () => {
    render(<CriarVagaScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Barista"));
    });
    await waitFor(() => {
      expect(screen.getByTestId("tarifa-info-card")).toBeTruthy();
      expect(screen.getByText("R$ 25.00")).toBeTruthy();
      expect(screen.getByText("6h")).toBeTruthy();
    });
  });

  it("ao selecionar 2 servicos o card de tarifa nao e exibido", async () => {
    render(<CriarVagaScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Barista"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Barman/Bartender"));
    });
    await waitFor(() => {
      expect(screen.queryByTestId("tarifa-info-card")).toBeNull();
    });
  });

  it("submeter com jornada menor que o minimo exibe erro de jornada minima", async () => {
    render(<CriarVagaScreen />);
    fireEvent.press(screen.getByText("Barista"));
    await selectDate();
    await selectTime("time-inicio-button", 18);
    await selectTime("time-fim-button", 20);
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
    await act(async () => {
      fireEvent.press(screen.getByText(/Publicar contratação/));
    });
    await waitFor(() => {
      expect(
        screen.getByText("Jornada minima para este servico e de 6h")
      ).toBeTruthy();
    });
  });
});
