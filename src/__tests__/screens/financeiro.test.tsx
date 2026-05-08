import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import FinanceiroScreen from "@/app/(home)/financeiro";
import { vagasService } from "@/services/vagas.service";
import { summaryService } from "@/services/summary.service";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      name: "Thiago",
      email: "thiago@email.com",
      module: "bars-restaurants",
      contractorId: "contractor-1",
      profileCompleted: true,
      userType: "contractor",
      avatarUrl: null,
    },
  }),
}));

jest.mock("@/services/vagas.service", () => ({
  vagasService: {
    listByContractor: jest.fn(),
  },
}));

jest.mock("@/services/summary.service", () => ({
  summaryService: {
    getContractorSummary: jest.fn(),
  },
}));

const mockVagasService = vagasService as jest.Mocked<typeof vagasService>;
const mockSummaryService = summaryService as jest.Mocked<typeof summaryService>;

const SUMMARY_MOCK = {
  currentMonthSpent: 15000,
  totalSpent: 45000,
  pendingAmount: 5000,
};

function makeVaga(id: string, title: string, status: string, chargeAmountInCents = 10000) {
  return {
    id,
    title,
    status,
    date: "2026-05-01T00:00:00.000Z",
    chargeAmountInCents,
  };
}

beforeEach(() => {
  mockSummaryService.getContractorSummary.mockResolvedValue(SUMMARY_MOCK);
});

afterEach(() => {
  jest.clearAllMocks();
});

// O card "Meus Gastos" sempre renderiza o label "Pendente" (referente ao valor pendente).
// Por isso, ao verificar badges de status das vagas, a contagem de "Pendente" inclui
// esse label fixo. Os testes usam getAllByText e contam corretamente:
//   - Testes com 1 vaga "Pendente": getAllByText("Pendente").length >= 2 (1 label + 1 badge)
//   - Testes com vagas "Pago": getAllByText("Pago").length === 1 (só o badge da vaga)
const SUMMARY_PENDING_LABEL_COUNT = 1;

describe("FinanceiroScreen — mapVagaToPaymentStatus", () => {
  it("exibe badge 'Pendente' para vaga com status OPEN", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v1", "Garçom para evento", "OPEN"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      const matches = screen.getAllByText("Pendente");
      expect(matches.length).toBe(SUMMARY_PENDING_LABEL_COUNT + 1);
    });
  });

  it("exibe badge 'Pendente' para vaga com status open (minúsculo)", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v1", "Barista", "open"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      const matches = screen.getAllByText("Pendente");
      expect(matches.length).toBe(SUMMARY_PENDING_LABEL_COUNT + 1);
    });
  });

  it("exibe badge 'Pendente' para vaga com status payment_pending", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v2", "Recepcionista", "payment_pending"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      const matches = screen.getAllByText("Pendente");
      expect(matches.length).toBe(SUMMARY_PENDING_LABEL_COUNT + 1);
    });
  });

  it("exibe badge 'Pendente' para vaga com status accepted", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v3", "Auxiliar de limpeza", "accepted"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      const matches = screen.getAllByText("Pendente");
      expect(matches.length).toBe(SUMMARY_PENDING_LABEL_COUNT + 1);
    });
  });

  it("exibe badge 'Pendente' para vaga cancelada (cancelled)", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v4", "Chef de cozinha", "cancelled"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      const matches = screen.getAllByText("Pendente");
      expect(matches.length).toBe(SUMMARY_PENDING_LABEL_COUNT + 1);
    });
  });

  it("exibe badge 'Pago' para vaga com status active", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v5", "Garçom para casamento", "active"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      expect(screen.getByText("Pago")).toBeTruthy();
    });
  });

  it("exibe badge 'Pago' para vaga com status finished", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v6", "Bartender", "finished"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      expect(screen.getByText("Pago")).toBeTruthy();
    });
  });

  it("exibe badge 'Pago' para vaga com status in_progress", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v7", "Barista", "in_progress"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      expect(screen.getByText("Pago")).toBeTruthy();
    });
  });

  it("exibe badge 'Pago' para vaga com status started", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v8", "Auxiliar de salão", "started"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      expect(screen.getByText("Pago")).toBeTruthy();
    });
  });

  it("exibe badge 'Pago' para vaga com status completed", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v9", "Recepcionista de evento", "completed"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      expect(screen.getByText("Pago")).toBeTruthy();
    });
  });

  it("exibe badge 'Pago' para vaga com status transfer_pending", async () => {
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v10", "Cozinheiro", "transfer_pending"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      expect(screen.getByText("Pago")).toBeTruthy();
    });
  });

  it("exibe múltiplas vagas com status corretos misturados", async () => {
    // open → Pendente, accepted → Pendente (2 badges pendente)
    // active → Pago, finished → Pago (2 badges pago)
    mockVagasService.listByContractor.mockResolvedValue([
      makeVaga("v11", "Garçom A", "open"),
      makeVaga("v12", "Garçom B", "active"),
      makeVaga("v13", "Garçom C", "accepted"),
      makeVaga("v14", "Garçom D", "finished"),
    ]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      const pendentes = screen.getAllByText("Pendente");
      const pagos = screen.getAllByText("Pago");
      // 2 badges de vaga + 1 label fixo do card summary
      expect(pendentes).toHaveLength(SUMMARY_PENDING_LABEL_COUNT + 2);
      expect(pagos).toHaveLength(2);
    });
  });

  it("exibe mensagem vazia quando não há vagas", async () => {
    mockVagasService.listByContractor.mockResolvedValue([]);

    render(<FinanceiroScreen />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum pagamento encontrado.")).toBeTruthy();
    });
  });
});
