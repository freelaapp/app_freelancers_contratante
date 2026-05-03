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
});
