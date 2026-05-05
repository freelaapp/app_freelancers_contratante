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
    fireEvent.press(screen.getByTestId(`${testID}-hour-btn-${hours}`));
  });
}

async function advanceToStep1() {
  await act(async () => {
    fireEvent.press(screen.getByText("Barista"));
  });
  await act(async () => {
    fireEvent.press(screen.getByText(/Proximo/));
  });
}

async function advanceToStep2() {
  await advanceToStep1();
  await selectDate();
  await selectTime("time-inicio-button", 17);
  await selectTime("time-fim-button", 23);
  await act(async () => {
    fireEvent.press(screen.getByText(/Proximo/));
  });
}

async function fillValidFormAndSubmit() {
  await advanceToStep2();
  await act(async () => {
    fireEvent.changeText(
      screen.getByPlaceholderText(/Preciso de 2 garçons/),
      "Evento corporativo no sábado, traje social exigido."
    );
  });
  await act(async () => {
    fireEvent.press(screen.getByText(/Publicar contratação/));
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({ id: "vaga-1", title: "Barista" });
});

describe("CriarVagaScreen", () => {
  describe("Step 0 — Servico", () => {
    it("renderiza titulo Nova contratacao", () => {
      render(<CriarVagaScreen />);
      expect(screen.getByText("Nova contratação")).toBeTruthy();
    });

    it("renderiza barra de progresso no passo 1 de 3", () => {
      render(<CriarVagaScreen />);
      expect(screen.getByTestId("progress-bar")).toBeTruthy();
      expect(screen.getByText("Passo 1 de 3 — Servico")).toBeTruthy();
    });

    it("renderiza chips de servicos no step 0", () => {
      render(<CriarVagaScreen />);
      expect(screen.getByText("Barista")).toBeTruthy();
      expect(screen.getByText("Barman/Bartender")).toBeTruthy();
      expect(screen.getByText("Garçom/Garçonete")).toBeTruthy();
    });

    it("botao Voltar nao aparece no step 0", () => {
      render(<CriarVagaScreen />);
      expect(screen.queryByTestId("btn-voltar")).toBeNull();
    });

    it("botao Proximo aparece no step 0", () => {
      render(<CriarVagaScreen />);
      expect(screen.getByText(/Proximo/)).toBeTruthy();
    });

    it("tentar avancar sem selecionar servico exibe erro de validacao", async () => {
      render(<CriarVagaScreen />);
      await act(async () => {
        fireEvent.press(screen.getByText(/Proximo/));
      });
      await waitFor(() => {
        expect(screen.getByText("Selecione ao menos um serviço")).toBeTruthy();
      });
    });

    it("apos selecionar servico e clicar Proximo avanca para step 1", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await waitFor(() => {
        expect(screen.getByText("Passo 2 de 3 — Quando e onde")).toBeTruthy();
      });
    });

    it("selecionar chip marca o chip como selecionado", () => {
      render(<CriarVagaScreen />);
      const chip = screen.getByText("Barista");
      fireEvent.press(chip);
      expect(chip).toBeTruthy();
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
  });

  describe("Step 1 — Quando e onde", () => {
    it("renderiza progresso no passo 2 de 3 apos avancar", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      expect(screen.getByText("Passo 2 de 3 — Quando e onde")).toBeTruthy();
    });

    it("botao Voltar aparece no step 1", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      expect(screen.getByTestId("btn-voltar")).toBeTruthy();
    });

    it("renderiza botao de data do evento no step 1", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      expect(screen.getByTestId("date-picker-button")).toBeTruthy();
    });

    it("campo de data exibe placeholder quando sem valor", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      expect(screen.getByText("Selecione a data")).toBeTruthy();
    });

    it("ao selecionar data via picker exibe o valor formatado no campo", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await selectDate();
      expect(screen.getByText("20/06/2026")).toBeTruthy();
    });

    it("seletores de horario nao aparecem sem data selecionada no step 1", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      expect(screen.queryByTestId("time-inicio-button")).toBeNull();
      expect(screen.queryByTestId("time-fim-button")).toBeNull();
    });

    it("seletor de horario de inicio aparece apos selecionar data", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await selectDate();
      expect(screen.getByTestId("time-inicio-button")).toBeTruthy();
    });

    it("seletor de horario de fim nao aparece antes de selecionar horario de inicio", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await selectDate();
      expect(screen.queryByTestId("time-fim-button")).toBeNull();
    });

    it("ao selecionar horario de inicio seletor de fim aparece", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await selectDate();
      await selectTime("time-inicio-button", 17);
      expect(screen.getByTestId("time-fim-button")).toBeTruthy();
    });

    it("seletor de fim nao exibe horas menores ou iguais a hora de inicio", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await selectDate();
      await selectTime("time-inicio-button", 18);
      expect(screen.queryByTestId("time-fim-button-hour-btn-18")).toBeNull();
      expect(screen.queryByTestId("time-fim-button-hour-btn-17")).toBeNull();
      expect(screen.getByTestId("time-fim-button-hour-btn-19")).toBeTruthy();
    });

    it("campo de endereco fica oculto quando switch No estabelecimento esta ON", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      expect(screen.queryByPlaceholderText("Rua, número, bairro...")).toBeNull();
    });

    it("campo de endereco fica visivel quando switch No estabelecimento esta OFF", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      const switchEl = screen.getByTestId("toggle-estabelecimento");
      fireEvent(switchEl, "valueChange", false);
      expect(screen.getByPlaceholderText("Rua, número, bairro...")).toBeTruthy();
    });

    it("tentar avancar sem data exibe erro de campo obrigatorio", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await act(async () => {
        fireEvent.press(screen.getByText(/Proximo/));
      });
      await waitFor(() => {
        expect(screen.getByText("Data do evento é obrigatória")).toBeTruthy();
      });
    });

    it("tentar avancar sem horario exibe erro de campo obrigatorio", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await selectDate();
      await act(async () => {
        fireEvent.press(screen.getByText(/Proximo/));
      });
      await waitFor(() => {
        expect(screen.getByText("Horário de início é obrigatório")).toBeTruthy();
      });
    });

    it("clicar Voltar no step 1 retorna ao step 0", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await act(async () => {
        fireEvent.press(screen.getByTestId("btn-voltar"));
      });
      await waitFor(() => {
        expect(screen.getByText("Passo 1 de 3 — Servico")).toBeTruthy();
      });
    });

    it("apos preencher data e horarios avancar para step 2", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      await waitFor(() => {
        expect(screen.getByText("Passo 3 de 3 — Detalhes")).toBeTruthy();
      });
    });
  });

  describe("Step 2 — Detalhes", () => {
    it("renderiza progresso no passo 3 de 3", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      expect(screen.getByText("Passo 3 de 3 — Detalhes")).toBeTruthy();
    });

    it("exibe card de resumo no step 2 com servico preenchido", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      expect(screen.getByTestId("resumo-servico")).toBeTruthy();
      expect(screen.getByText("Barista")).toBeTruthy();
    });

    it("card de resumo exibe data selecionada", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      await waitFor(() => {
        expect(screen.getByTestId("resumo-data")).toBeTruthy();
        expect(screen.getByText("20/06/2026")).toBeTruthy();
      });
    });

    it("card de resumo exibe horario selecionado", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      await waitFor(() => {
        expect(screen.getByTestId("resumo-horario")).toBeTruthy();
        expect(screen.getByText("17:00 - 23:00")).toBeTruthy();
      });
    });

    it("card de resumo exibe local como No estabelecimento quando switch ON", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      await waitFor(() => {
        expect(screen.getByTestId("resumo-local")).toBeTruthy();
        expect(screen.getByText("No estabelecimento")).toBeTruthy();
      });
    });

    it("botao Voltar aparece no step 2", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      expect(screen.getByTestId("btn-voltar")).toBeTruthy();
    });

    it("botao Publicar aparece no step 2", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      expect(screen.getByText(/Publicar contratação/)).toBeTruthy();
    });

    it("clicar Voltar no step 2 retorna ao step 1", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep2();
      await act(async () => {
        fireEvent.press(screen.getByTestId("btn-voltar"));
      });
      await waitFor(() => {
        expect(screen.getByText("Passo 2 de 3 — Quando e onde")).toBeTruthy();
      });
    });

    it("submeter sem endereco quando switch esta OFF exibe erro no step 2", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      const switchEl = screen.getByTestId("toggle-estabelecimento");
      fireEvent(switchEl, "valueChange", false);
      await selectDate();
      await selectTime("time-inicio-button", 18);
      await selectTime("time-fim-button", 23);
      await act(async () => {
        fireEvent.press(screen.getByText(/Proximo/));
      });
      await waitFor(() => {
        expect(screen.getByText("Passo 3 de 3 — Detalhes")).toBeTruthy();
      });
      await act(async () => {
        fireEvent.changeText(
          screen.getByPlaceholderText(/Preciso de 2 garçons/),
          "Evento corporativo no sábado, traje social exigido."
        );
      });
      await act(async () => {
        fireEvent.press(screen.getByText(/Publicar contratação/));
      });
      await waitFor(() => {
        expect(screen.getByTestId("resumo-erro-endereco")).toBeTruthy();
      });
    });

    it("submeter com jornada menor que o minimo exibe erro de jornada minima no resumo", async () => {
      render(<CriarVagaScreen />);
      await advanceToStep1();
      await selectDate();
      await selectTime("time-inicio-button", 18);
      await selectTime("time-fim-button", 20);
      await act(async () => {
        fireEvent.press(screen.getByText(/Proximo/));
      });
      await waitFor(() => {
        expect(screen.getByText("Passo 3 de 3 — Detalhes")).toBeTruthy();
      });
      await act(async () => {
        fireEvent.changeText(
          screen.getByPlaceholderText(/Preciso de 2 garçons/),
          "Evento corporativo no sábado, traje social exigido."
        );
      });
      await act(async () => {
        fireEvent.press(screen.getByText(/Publicar contratação/));
      });
      await waitFor(() => {
        expect(screen.getByTestId("resumo-erro-horario")).toBeTruthy();
      });
    });

    it("submit no step 2 chama vagasService.create com payload correto", async () => {
      render(<CriarVagaScreen />);
      await fillValidFormAndSubmit();
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

    it("apos sucesso chama toast.success e router.back", async () => {
      jest.useFakeTimers();
      const routerMock = jest.requireMock("expo-router");
      render(<CriarVagaScreen />);
      await fillValidFormAndSubmit();
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Vaga publicada com sucesso!");
      });
      await act(async () => {
        jest.runAllTimers();
      });
      expect(routerMock.router.back).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it("exibe indicador de loading enquanto a vaga e criada", async () => {
      let resolveCreate!: (value: unknown) => void;
      mockCreate.mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
      );
      render(<CriarVagaScreen />);
      await advanceToStep2();
      await act(async () => {
        fireEvent.changeText(
          screen.getByPlaceholderText(/Preciso de 2 garçons/),
          "Evento corporativo no sábado, traje social exigido."
        );
      });
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
      await fillValidFormAndSubmit();
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Erro ao publicar a vaga. Tente novamente."
        );
      });
    });
  });
});
