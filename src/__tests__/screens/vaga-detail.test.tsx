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

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetById.mockResolvedValue({
    id: "vaga-1",
    title: "Garçom para evento",
    status: "OPEN",
    date: "20/06/2026",
    startTime: "18:00",
  });
  mockListByVacancy.mockResolvedValue([]);
  mockGetByVacancy.mockRejectedValue(new Error("no job"));
  mockGenerateCheckinCode.mockResolvedValue("123456");
  mockGenerateCheckoutCode.mockResolvedValue("789012");
  mockGetCheckinStatus.mockResolvedValue(true);
  mockConfirmCheckout.mockResolvedValue(undefined);
  mockCreateVacancyPayment.mockResolvedValue({
    id: "pay-1",
    status: "PENDING",
    value: 150,
    correlationId: "corr-1",
    paymentLinkUrl: null,
    qrCodeImage: null,
    brCode: "00020101021226",
    createdAt: "2026-05-04T10:00:00.000Z",
    updatedAt: "2026-05-04T10:00:00.000Z",
  });
  mockGetVacancyPayment.mockResolvedValue({
    id: "pay-1",
    status: "PAID",
    value: 150,
    correlationId: "corr-1",
    paymentLinkUrl: null,
    qrCodeImage: null,
    brCode: "00020101021226",
    createdAt: "2026-05-04T10:00:00.000Z",
    updatedAt: "2026-05-04T10:00:00.000Z",
  });
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("VagaDetailScreen", () => {
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

  it("13. aceitar candidato chama candidaturasService.accept e avança stepAtual para 2", async () => {
    mockListByVacancy.mockResolvedValue([
      { id: "c-1", name: "João Silva", status: "pending" },
    ]);
    await renderAndWait();
    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-aceitar-c-1"));
    });
    expect(mockAccept).toHaveBeenCalledWith("c-1");
    await waitFor(() => {
      expect(screen.getByText("Pagar")).toBeTruthy();
    });
  });

  it("15. ao pressionar Pagar (step 2) abre modal PIX com createVacancyPayment usando payment em centavos", async () => {
    mockGetById.mockResolvedValue({
      id: "vaga-1",
      title: "Garçom para evento",
      status: "OPEN",
      date: "20/06/2026",
      startTime: "18:00",
      payment: 15185,
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
    await waitFor(() => {
      expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
    });
  });

  it("15b. ao pressionar Pagar sem campo payment usa chargeAmountInCents como fallback", async () => {
    mockGetById.mockResolvedValue({
      id: "vaga-1",
      title: "Garçom para evento",
      status: "OPEN",
      date: "20/06/2026",
      startTime: "18:00",
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

  it("16. botão Já paguei com status PAID avança para step 3", async () => {
    mockGetById.mockResolvedValue({ id: "vaga-1", title: "Garçom para evento", status: "OPEN", payment: 15185 });
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

  it("17. botão Já paguei com status PENDING exibe toast de erro", async () => {
    mockGetById.mockResolvedValue({ id: "vaga-1", title: "Garçom para evento", status: "OPEN", payment: 15185 });
    mockGetVacancyPayment.mockResolvedValue({
      id: "pay-1",
      status: "PENDING",
      value: 150,
      correlationId: "corr-1",
      paymentLinkUrl: null,
      qrCodeImage: null,
      brCode: "00020101021226",
      createdAt: "2026-05-04T10:00:00.000Z",
      updatedAt: "2026-05-04T10:00:00.000Z",
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
    await waitFor(() => {
      expect(screen.getByText("Já paguei")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByText("Já paguei"));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Pagamento ainda não confirmado");
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
    jest.useFakeTimers();
    mockGetById.mockResolvedValue({ id: "vaga-1", title: "Garçom para evento", status: "OPEN", payment: 15185 });
    mockGetVacancyPayment.mockResolvedValue({
      id: "pay-1",
      status: "COMPLETED",
      value: 150,
      correlationId: "corr-1",
      paymentLinkUrl: null,
      qrCodeImage: null,
      brCode: "00020101021226",
      createdAt: "2026-05-04T10:00:00.000Z",
      updatedAt: "2026-05-04T10:00:00.000Z",
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
    await waitFor(() => {
      expect(screen.getByText("Pagamento via PIX")).toBeTruthy();
    });
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    await waitFor(() => {
      expect(mockGetVacancyPayment).toHaveBeenCalled();
      expect(screen.queryByText("Pagamento via PIX")).toBeNull();
      expect(mockToastSuccess).toHaveBeenCalledWith("Pagamento confirmado!");
    });
    jest.useRealTimers();
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
});
