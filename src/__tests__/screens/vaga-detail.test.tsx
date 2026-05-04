import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import VagaDetailScreen from "@/app/(home)/vaga/[id]";

// ─── Mocks de navegação ───────────────────────────────────────────────────────

const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ id: "vaga-1" }),
  useRouter: jest.fn().mockReturnValue({ back: mockRouterBack, push: mockRouterPush }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ─── Mocks de contexto ────────────────────────────────────────────────────────

jest.mock("@/context/auth-context", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { module: "bars-restaurants", contractorId: "contractor-1" },
  }),
}));

jest.mock("@/context/notifications-context", () => ({
  useNotifications: () => ({ addNotification: jest.fn() }),
}));

// ─── Mocks de serviços ────────────────────────────────────────────────────────

const mockGetById = jest.fn();
jest.mock("@/services/vagas.service", () => ({
  vagasService: {
    getById: (...args: unknown[]) => mockGetById(...args),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

const mockListByVacancy = jest.fn();
const mockAccept = jest.fn().mockResolvedValue({});
const mockReject = jest.fn().mockResolvedValue({});
jest.mock("@/services/candidaturas.service", () => ({
  candidaturasService: {
    listByVacancy: (...args: unknown[]) => mockListByVacancy(...args),
    accept: (...args: unknown[]) => mockAccept(...args),
    reject: (...args: unknown[]) => mockReject(...args),
  },
}));

const mockGetByVacancy = jest.fn();
const mockGenerateCheckinCode = jest.fn();
const mockGenerateCheckoutCode = jest.fn();
const mockGetCheckinStatus = jest.fn();
const mockConfirmCheckout = jest.fn();
jest.mock("@/services/jobs.service", () => ({
  jobsService: {
    getByVacancy: (...args: unknown[]) => mockGetByVacancy(...args),
    generateCheckinCode: (...args: unknown[]) => mockGenerateCheckinCode(...args),
    generateCheckoutCode: (...args: unknown[]) => mockGenerateCheckoutCode(...args),
    getCheckinStatus: (...args: unknown[]) => mockGetCheckinStatus(...args),
    confirmCheckout: (...args: unknown[]) => mockConfirmCheckout(...args),
  },
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock("@/utils/toast", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    info: jest.fn(),
  },
}));

jest.mock("@/services/feedbacks.service", () => ({
  feedbacksService: { create: jest.fn().mockResolvedValue({}) },
}));

const mockCreateVacancyPayment = jest.fn();
const mockGetVacancyPayment = jest.fn();
jest.mock("@/services/payments.service", () => ({
  paymentsService: {
    createVacancyPayment: (...args: unknown[]) => mockCreateVacancyPayment(...args),
    getVacancyPayment: (...args: unknown[]) => mockGetVacancyPayment(...args),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_VAGA = {
  id: "vaga-1",
  title: "Garçom para evento",
  status: "OPEN",
  date: "2026-06-20T00:00:00.000Z",
  startTime: "2026-06-20T18:00:00.000Z",
  payment: 15185,
};

const BASE_PAYMENT_PENDING = {
  id: "pay-1",
  status: "PENDING",
  value: 150,
  correlationId: "corr-1",
  paymentLinkUrl: null,
  qrCodeImage: null,
  brCode: "00020101021226",
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

const BASE_PAYMENT_PAID = {
  ...BASE_PAYMENT_PENDING,
  status: "PAID",
};

const BASE_PAYMENT_COMPLETED = {
  ...BASE_PAYMENT_PENDING,
  status: "COMPLETED",
};

async function renderAndWait() {
  render(<VagaDetailScreen />);
  await waitFor(() => {
    expect(screen.queryByText("Garçom para evento")).toBeTruthy();
  });
}

async function renderWithJobAtStep(step: number) {
  const statusByStep: Record<number, string> = {
    3: "active",
    4: "checking_out",
  };
  mockGetByVacancy.mockResolvedValueOnce({
    id: "job-1",
    status: statusByStep[step] ?? "active",
  });
  render(<VagaDetailScreen />);
  await waitFor(() => {
    expect(screen.queryByText("Garçom para evento")).toBeTruthy();
  });
}

async function renderAtPaymentStep() {
  mockGetById.mockResolvedValue({ ...BASE_VAGA });
  mockListByVacancy.mockResolvedValue([
    { id: "c-1", name: "João Silva", status: "accepted" },
  ]);
  mockGetByVacancy.mockRejectedValue(new Error("no job"));
  render(<VagaDetailScreen />);
  await waitFor(() => {
    expect(screen.queryByText("Garçom para evento")).toBeTruthy();
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetById.mockResolvedValue({ ...BASE_VAGA });
  mockListByVacancy.mockResolvedValue([]);
  mockGetByVacancy.mockRejectedValue(new Error("no job"));
  mockGenerateCheckinCode.mockResolvedValue("123456");
  mockGenerateCheckoutCode.mockResolvedValue("789012");
  mockGetCheckinStatus.mockResolvedValue(true);
  mockConfirmCheckout.mockResolvedValue(undefined);
  mockCreateVacancyPayment.mockResolvedValue({ ...BASE_PAYMENT_PENDING });
  mockGetVacancyPayment.mockResolvedValue({ ...BASE_PAYMENT_PAID });
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("VagaDetailScreen", () => {
  it("0a. listByVacancy é chamado com o módulo do usuário (bars-restaurants)", async () => {
    await renderAndWait();
    expect(mockListByVacancy).toHaveBeenCalledWith("bars-restaurants", "vaga-1");
  });

  it("0b. listByVacancy é chamado com módulo home-services quando usuário pertence a esse módulo", async () => {
    const { useAuth } = require("@/context/auth-context");
    useAuth.mockReturnValueOnce({
      user: { module: "home-services", contractorId: "contractor-2" },
    });
    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });
    expect(mockListByVacancy).toHaveBeenCalledWith("home-services", "vaga-1");
  });

  it("0c. accept é chamado com módulo home-services quando usuário pertence a esse módulo", async () => {
    const { useAuth } = require("@/context/auth-context");
    useAuth.mockReturnValue({
      user: { module: "home-services", contractorId: "contractor-2" },
    });
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "João Silva", status: "pending" },
    ]);
    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-aceitar-c-1"));
    });
    expect(mockAccept).toHaveBeenCalledWith("home-services", "c-1");
    useAuth.mockReturnValue({
      user: { module: "bars-restaurants", contractorId: "contractor-1" },
    });
  });

  it("1. exibe loading indicator enquanto carrega dados", () => {
    mockGetById.mockImplementation(() => new Promise(() => {}));
    render(<VagaDetailScreen />);
    const indicators = screen.UNSAFE_queryAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThan(0);
  });

  it("2. exibe título da vaga após carregamento", async () => {
    await renderAndWait();
    expect(screen.getByText("Garçom para evento")).toBeTruthy();
  });

  it("3. exibe status da vaga", async () => {
    await renderAndWait();
    expect(screen.getByText("OPEN")).toBeTruthy();
  });

  it("4. ao pressionar botão Check-in chama generateCheckinCode e exibe modal", async () => {
    await renderWithJobAtStep(3);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-in"));
    });
    expect(mockGenerateCheckinCode).toHaveBeenCalledWith("job-1");
    expect(screen.getByText("Mande o código de check-in para o freelancer")).toBeTruthy();
  });

  it("5. modal de check-in exibe o código gerado formatado", async () => {
    await renderWithJobAtStep(3);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-in"));
    });
    expect(screen.getByText("1  2  3  4  5  6")).toBeTruthy();
  });

  it("6. botão confirmar no modal de check-in chama getCheckinStatus", async () => {
    await renderWithJobAtStep(3);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-in"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Freelancer confirmou o código"));
    });
    expect(mockGetCheckinStatus).toHaveBeenCalledWith("bars-restaurants", "job-1");
  });

  it("7. quando getCheckinStatus retorna true fecha modal e avança para step 4", async () => {
    mockGetCheckinStatus.mockResolvedValue(true);
    await renderWithJobAtStep(3);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-in"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Freelancer confirmou o código"));
    });
    await waitFor(() => {
      expect(screen.queryByText("Mande o código de check-in para o freelancer")).toBeNull();
    });
  });

  it("8. quando getCheckinStatus retorna false mantém modal aberto e exibe toast.error", async () => {
    mockGetCheckinStatus.mockResolvedValue(false);
    await renderWithJobAtStep(3);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-in"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Freelancer confirmou o código"));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("O freelancer ainda não confirmou o check-in.");
    });
    expect(screen.getByText("Mande o código de check-in para o freelancer")).toBeTruthy();
  });

  it("9. ao pressionar botão Check-out (step 4) chama generateCheckoutCode e exibe modal", async () => {
    await renderWithJobAtStep(4);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-out"));
    });
    expect(mockGenerateCheckoutCode).toHaveBeenCalledWith("job-1");
    expect(screen.getByText("Mande o código de check-out para o freelancer")).toBeTruthy();
  });

  it("10. botão confirmar no modal de check-out chama confirmCheckout", async () => {
    await renderWithJobAtStep(4);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-out"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Freelancer confirmou o código"));
    });
    expect(mockConfirmCheckout).toHaveBeenCalledWith("bars-restaurants", "job-1");
  });

  it("11. quando confirmCheckout resolve fecha modal e exibe toast.success", async () => {
    mockConfirmCheckout.mockResolvedValue(undefined);
    await renderWithJobAtStep(4);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-out"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Freelancer confirmou o código"));
    });
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("Check-out confirmado!");
      expect(screen.queryByText("Mande o código de check-out para o freelancer")).toBeNull();
    });
  });

  it("12. quando confirmCheckout rejeita com 409 exibe toast.error com mensagem correta", async () => {
    const err = Object.assign(new Error("Conflict"), { response: { status: 409 } });
    mockConfirmCheckout.mockRejectedValue(err);
    await renderWithJobAtStep(4);
    await act(async () => {
      fireEvent.press(screen.getByText("Check-out"));
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Freelancer confirmou o código"));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("O freelancer ainda não confirmou o check-out.");
    });
  });

  it("13. aceitar candidato chama candidaturasService.accept com módulo e avança stepAtual para 2", async () => {
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "João Silva", status: "pending" },
    ]);
    await renderAndWait();
    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-aceitar-c-1"));
    });
    expect(mockAccept).toHaveBeenCalledWith("bars-restaurants", "c-1");
    await waitFor(() => {
      expect(screen.getByText("Pagar")).toBeTruthy();
    });
  });

  it("14. seção de candidatos permanece visível quando stepAtual >= 2", async () => {
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "Maria", status: "accepted" },
    ]);
    mockGetByVacancy.mockResolvedValueOnce({ id: "job-1", status: "active" });
    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });
    expect(screen.getByText(/Candidatos/)).toBeTruthy();
  });

  it("15. ao pressionar Pagar (step 2) abre modal PIX com createVacancyPayment usando payment em centavos", async () => {
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    expect(mockCreateVacancyPayment).toHaveBeenCalledWith("vaga-1", 15185);
    await waitFor(() => {
      expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
    });
  });

  it("15b. ao pressionar Pagar sem campo payment usa chargeAmountInCents como fallback", async () => {
    mockGetById.mockResolvedValue({
      id: "vaga-1",
      title: "Garçom para evento",
      status: "OPEN",
      chargeAmountInCents: 9900,
    });
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "João Silva", status: "accepted" },
    ]);
    mockGetByVacancy.mockRejectedValue(new Error("no job"));
    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    expect(mockCreateVacancyPayment).toHaveBeenCalledWith("vaga-1", 9900);
  });

  it("15c. ao pressionar Pagar sem campos em centavos usa value (reais) convertido para centavos", async () => {
    mockGetById.mockResolvedValue({
      id: "vaga-1",
      title: "Garçom para evento",
      status: "OPEN",
      value: 151.85,
    });
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "João Silva", status: "accepted" },
    ]);
    mockGetByVacancy.mockRejectedValue(new Error("no job"));
    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    expect(mockCreateVacancyPayment).toHaveBeenCalledWith("vaga-1", 15185);
  });

  it("15d. quando chargeValue resulta em 0 exibe toast.error e NÃO abre modal", async () => {
    mockGetById.mockResolvedValue({
      id: "vaga-1",
      title: "Garçom para evento",
      status: "OPEN",
    });
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "João Silva", status: "accepted" },
    ]);
    mockGetByVacancy.mockRejectedValue(new Error("no job"));
    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    expect(mockCreateVacancyPayment).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith("Valor da vaga não encontrado. Recarregue a tela.");
    expect(screen.queryByText("Pagamento via PIX")).toBeNull();
  });

  it("15e. quando API retorna brCode sem qrCodeImage modal abre sem spinner (brCode disponível imediatamente)", async () => {
    mockCreateVacancyPayment.mockResolvedValue({
      ...BASE_PAYMENT_PENDING,
      brCode: "00020101021226",
      qrCodeImage: null,
    });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
    });
    expect(screen.queryByText("Gerando QR Code...")).toBeNull();
  });

  it("15f. quando API retorna sem qrCodeImage e sem brCode exibe spinner Gerando QR Code", async () => {
    mockCreateVacancyPayment.mockResolvedValue({
      ...BASE_PAYMENT_PENDING,
      brCode: null,
      qrCodeImage: null,
    });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
      expect(screen.getByText("Gerando QR Code...")).toBeTruthy();
    });
  });

  it("15g. spinner some e brCode é exibido quando polling retorna com dados", async () => {
    mockCreateVacancyPayment.mockResolvedValue({
      ...BASE_PAYMENT_PENDING,
      brCode: null,
      qrCodeImage: null,
    });
    mockGetVacancyPayment.mockResolvedValue({
      ...BASE_PAYMENT_PENDING,
      brCode: "00020101021226",
      qrCodeImage: null,
    });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Gerando QR Code...")).toBeTruthy();
    });
    await waitFor(
      () => {
        expect(screen.queryByText("Gerando QR Code...")).toBeNull();
      },
      { timeout: 5000 }
    );
  });

  it("16. botão Já paguei com status PAID avança para step 3", async () => {
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Já paguei")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Já paguei"));
    });
    expect(mockGetVacancyPayment).toHaveBeenCalledWith("vaga-1");
    await waitFor(() => {
      expect(screen.queryByText("Pagamento via PIX")).toBeNull();
    });
  });

  it("16b. botão Já paguei com status COMPLETED também avança para step 3", async () => {
    mockGetVacancyPayment.mockResolvedValue({ ...BASE_PAYMENT_COMPLETED });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Já paguei")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Já paguei"));
    });
    await waitFor(() => {
      expect(screen.queryByText("Pagamento via PIX")).toBeNull();
    });
  });

  it("17. botão Já paguei com status PENDING exibe toast de erro", async () => {
    mockGetVacancyPayment.mockResolvedValue({ ...BASE_PAYMENT_PENDING });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Já paguei")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Já paguei"));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Pagamento ainda não confirmado");
    });
    expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
  });

  it("17b. botão Já paguei com status FAILED exibe toast de erro e NÃO avança step", async () => {
    mockGetVacancyPayment.mockResolvedValue({
      ...BASE_PAYMENT_PENDING,
      status: "FAILED",
    });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Já paguei")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Já paguei"));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Pagamento ainda não confirmado");
    });
    expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
  });

  it("17c. botão Já paguei com status EXPIRED exibe toast de erro e NÃO avança step", async () => {
    mockGetVacancyPayment.mockResolvedValue({
      ...BASE_PAYMENT_PENDING,
      status: "EXPIRED",
    });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Já paguei")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Já paguei"));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Pagamento ainda não confirmado");
    });
    expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
  });

  it("17d. ao fechar modal PIX paymentPolling é resetado para false", async () => {
    mockCreateVacancyPayment.mockResolvedValue({
      ...BASE_PAYMENT_PENDING,
      brCode: null,
      qrCodeImage: null,
    });
    await renderAtPaymentStep();
    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });
    await waitFor(() => {
      expect(screen.getByText("Gerando QR Code...")).toBeTruthy();
    });
    await act(async () => {
      const closeButtons = screen.UNSAFE_queryAllByType(require("react-native").TouchableOpacity);
      const closeBtn = closeButtons.find((btn) =>
        btn.props.hitSlop === 8 && btn.props.onPress
      );
      if (closeBtn) closeBtn.props.onPress();
    });
    await waitFor(() => {
      expect(screen.queryByText("Pagamento via PIX")).toBeNull();
    });
  });

  it("18. candidato com status ACCEPTED (maiúsculo da API) não exibe botões aceitar/recusar", async () => {
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "Thiago Morgado", status: "ACCEPTED" },
    ]);
    mockGetByVacancy.mockRejectedValue(new Error("no job"));
    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });
    expect(screen.queryByTestId("btn-aceitar-c-1")).toBeNull();
  });

  it("19. polling automático fecha modal e avança para step 3 quando status COMPLETED", async () => {
    const fakeNow = Date.now();
    jest.useFakeTimers();
    jest.setSystemTime(fakeNow);

    mockGetById.mockResolvedValue({ ...BASE_VAGA });
    mockCreateVacancyPayment.mockResolvedValue({ ...BASE_PAYMENT_PENDING });
    mockGetVacancyPayment.mockResolvedValue({ ...BASE_PAYMENT_COMPLETED });
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "João Silva", status: "accepted" },
    ]);
    mockGetByVacancy.mockRejectedValue(new Error("no job"));

    render(<VagaDetailScreen />);
    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Pagar"));
    });

    await waitFor(() => {
      expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
    });

    // Avança o system time em 9s (acima do guard de 8s) e dispara o interval de 5s
    await act(async () => {
      jest.setSystemTime(fakeNow + 9000);
      jest.advanceTimersByTime(9000);
    });

    await waitFor(() => {
      expect(mockGetVacancyPayment).toHaveBeenCalled();
      expect(screen.queryByText("Pagamento via PIX")).toBeNull();
      expect(mockToastSuccess).toHaveBeenCalledWith("Pagamento confirmado!");
    });

    jest.useRealTimers();
  });
});
