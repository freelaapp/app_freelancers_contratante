import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import HomeScreen from "@/app/(home)/index";
import * as pendingStore from "@/utils/pending-vaga-store";

jest.mock("@/utils/pending-vaga-store", () => ({
  consumePendingVaga: jest.fn().mockReturnValue(null),
}));

// ─── Mocks de navegação e contexto ───────────────────────────────────────────

const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useFocusEffect: (cb: () => void) => cb(),
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

const mockUseAuth = jest.fn();
jest.mock("@/context/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/context/notifications-context", () => ({
  useNotifications: () => ({ hasUnread: false }),
}));

jest.mock("@/services/summary.service", () => ({
  summaryService: {
    getContractorSummary: jest.fn().mockResolvedValue({}),
  },
}));

// ─── Mock do hook useHomeVagas ────────────────────────────────────────────────

const mockOnRefresh = jest.fn();
const mockFetchVagas = jest.fn().mockResolvedValue(undefined);
const mockAddVaga = jest.fn();
const mockUseHomeVagas = jest.fn();

jest.mock("@/hooks/useHomeVagas", () => ({
  useHomeVagas: () => mockUseHomeVagas(),
}));

// ─── Dados de fixture ─────────────────────────────────────────────────────────

const USER_FIXTURE = {
  id: "user-1",
  name: "Maria Contratante",
  email: "maria@example.com",
  profileCompleted: true,
  userType: "contractor" as const,
  module: "bars-restaurants" as const,
  contractorId: "contractor-123",
  avatarUrl: null,
};

const VAGA_ABERTA_FIXTURE = {
  id: "vaga-1",
  title: "Garçom para evento",
  location: "São Paulo, SP",
  date: "10/06/2026",
  startTime: "18:00",
  status: "open",
  value: 250,
};

const VAGA_CONFIRMADA_FIXTURE = {
  id: "vaga-2",
  title: "Barman para casamento",
  location: "Campinas, SP",
  date: "15/06/2026",
  startTime: "20:00",
  status: "confirmed",
  value: 400,
};

// ─── Setup padrão ─────────────────────────────────────────────────────────────

function setupDefaultAuth() {
  mockUseAuth.mockReturnValue({ user: USER_FIXTURE });
}

type HomeVagasOverride = {
  vagas?: typeof VAGA_ABERTA_FIXTURE[];
  loading?: boolean;
  refreshing?: boolean;
  fetchVagas?: jest.Mock;
  onRefresh?: jest.Mock;
  addVaga?: jest.Mock;
};

function setupHomeVagas(overrides: HomeVagasOverride = {}) {
  mockUseHomeVagas.mockReturnValue({
    vagas: [],
    loading: false,
    refreshing: false,
    fetchVagas: mockFetchVagas,
    onRefresh: mockOnRefresh,
    addVaga: mockAddVaga,
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupDefaultAuth();
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("HomeScreen", () => {
  describe("Estado de carregamento", () => {
    it("exibe ActivityIndicator enquanto loading é true", () => {
      setupHomeVagas({ loading: true });

      render(<HomeScreen />);

      expect(screen.getByTestId("home-loading")).toBeTruthy();
    });

    it("não exibe o estado vazio enquanto loading é true", () => {
      setupHomeVagas({ loading: true });

      render(<HomeScreen />);

      expect(screen.queryByText("Nenhuma vaga cadastrada")).toBeNull();
    });
  });

  describe("Estado vazio", () => {
    it("exibe mensagem de estado vazio quando não há vagas", () => {
      setupHomeVagas({ loading: false, vagas: [] });

      render(<HomeScreen />);

      expect(screen.getByText("Nenhuma vaga cadastrada")).toBeTruthy();
      expect(
        screen.getByText("Crie sua primeira vaga para começar a contratar.")
      ).toBeTruthy();
    });

    it("não exibe botão CTA duplicado no estado vazio", () => {
      setupHomeVagas({ loading: false, vagas: [] });

      render(<HomeScreen />);

      expect(screen.queryByText(/Criar minha primeira vaga/)).toBeNull();
    });
  });

  describe("Listagem de vagas", () => {
    it("renderiza card de vaga quando há vagas", () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      expect(screen.getAllByText("Garçom para evento").length).toBeGreaterThan(0);
    });

    it("renderiza múltiplos cards quando há múltiplas vagas", () => {
      setupHomeVagas({
        loading: false,
        vagas: [VAGA_ABERTA_FIXTURE, VAGA_CONFIRMADA_FIXTURE],
      });

      render(<HomeScreen />);

      expect(screen.getAllByText("Garçom para evento").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Barman para casamento").length).toBeGreaterThan(0);
    });

    it('exibe seção "Vagas Abertas" quando há vagas com status aguardando', () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      expect(screen.getByText("Vagas Abertas")).toBeTruthy();
    });

    it('exibe seção "Próximas Contratações" apenas com vagas confirmadas', () => {
      setupHomeVagas({
        loading: false,
        vagas: [VAGA_CONFIRMADA_FIXTURE],
      });

      render(<HomeScreen />);

      expect(screen.getByText("Próximas Contratações")).toBeTruthy();
    });

    it('não exibe seção "Próximas Contratações" para vagas abertas', () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      expect(screen.queryByText("Próximas Contratações")).toBeNull();
    });

    it('exibe seção "Histórico" para vagas finalizadas', () => {
      const vagaFinalizada = { ...VAGA_ABERTA_FIXTURE, status: "finished" };
      setupHomeVagas({ loading: false, vagas: [vagaFinalizada] });

      render(<HomeScreen />);

      expect(screen.getByText("Histórico")).toBeTruthy();
      expect(screen.queryByText("Próximas Contratações")).toBeNull();
      expect(screen.queryByText("Vagas Abertas")).toBeNull();
    });

    it("navega para a tela de detalhes ao pressionar um card de vaga", () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      const vagaTitles = screen.getAllByText("Garçom para evento");
      fireEvent.press(vagaTitles[0]);

      expect(mockRouterPush).toHaveBeenCalledWith("/(home)/vaga/vaga-1");
    });
  });

  describe("Botão Criar Vaga (topo da tela)", () => {
    it("exibe o botão Criar Vaga no topo mesmo com vagas listadas", () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      expect(screen.getByText(/^[+].+Criar Vaga/)).toBeTruthy();
    });

    it("navega para criar-vaga ao pressionar o botão do topo", () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      fireEvent.press(screen.getByText(/^[+].+Criar Vaga/));

      expect(mockRouterPush).toHaveBeenCalledWith("/(home)/criar-vaga");
    });
  });

  describe("HomeHeader", () => {
    it("exibe o nome do usuário logado", () => {
      setupHomeVagas({ loading: false, vagas: [] });

      render(<HomeScreen />);

      expect(screen.getByText("Maria Contratante")).toBeTruthy();
    });

    it("exibe fallback 'Usuário' quando user é null", () => {
      mockUseAuth.mockReturnValue({ user: null });
      setupHomeVagas({ loading: false, vagas: [] });

      render(<HomeScreen />);

      expect(screen.getByText("Usuário")).toBeTruthy();
    });

    it("navega para notificações ao pressionar o ícone", () => {
      setupHomeVagas({ loading: false, vagas: [] });

      render(<HomeScreen />);

      const notifButton = screen.getByTestId("header-notifications-button");
      fireEvent.press(notifButton);

      expect(mockRouterPush).toHaveBeenCalledWith("/(home)/notificacoes");
    });
  });

  describe("Inserção otimista de vaga pendente (useFocusEffect)", () => {
    it("chama addVaga somente após fetchVagas resolver", async () => {
      const order: string[] = [];
      let resolveFetch!: () => void;

      const mockFetchVagasOrdered = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveFetch = () => {
              order.push("fetchVagas_resolved");
              resolve();
            };
          })
      );

      const mockAddVagaOrdered = jest.fn(() => {
        order.push("addVaga_called");
      });

      jest.spyOn(pendingStore, "consumePendingVaga").mockReturnValueOnce({
        id: "vaga-pending",
        title: "Vaga Pendente",
        status: "OPEN",
      });

      mockUseHomeVagas.mockReturnValue({
        vagas: [],
        loading: false,
        refreshing: false,
        fetchVagas: mockFetchVagasOrdered,
        onRefresh: mockOnRefresh,
        addVaga: mockAddVagaOrdered,
      });

      render(<HomeScreen />);

      resolveFetch();

      await act(async () => {
        await Promise.resolve();
      });

      expect(order).toEqual(["fetchVagas_resolved", "addVaga_called"]);
    });

    it("não chama addVaga quando não há vaga pendente", async () => {
      jest.spyOn(pendingStore, "consumePendingVaga").mockReturnValueOnce(null);

      const mockAddVaga = jest.fn();
      const mockFetchVagasResolved = jest.fn().mockResolvedValue(undefined);

      mockUseHomeVagas.mockReturnValue({
        vagas: [],
        loading: false,
        refreshing: false,
        fetchVagas: mockFetchVagasResolved,
        onRefresh: mockOnRefresh,
        addVaga: mockAddVaga,
      });

      render(<HomeScreen />);

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockAddVaga).not.toHaveBeenCalled();
    });

    it("chama fetchVagas ao ganhar foco, mesmo sem vaga pendente", async () => {
      jest.spyOn(pendingStore, "consumePendingVaga").mockReturnValueOnce(null);

      const mockFetchVagasResolved = jest.fn().mockResolvedValue(undefined);

      mockUseHomeVagas.mockReturnValue({
        vagas: [],
        loading: false,
        refreshing: false,
        fetchVagas: mockFetchVagasResolved,
        onRefresh: mockOnRefresh,
        addVaga: jest.fn(),
      });

      render(<HomeScreen />);

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockFetchVagasResolved).toHaveBeenCalled();
    });
  });

  describe("Pull-to-refresh", () => {
    it("passa a prop onRefresh para o RefreshControl", () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      const scrollView = screen.getByTestId("home-scroll-view");
      expect(scrollView).toBeTruthy();
    });

    it("exibe scroll view com refreshControl quando refreshing é true", () => {
      setupHomeVagas({
        loading: false,
        vagas: [VAGA_ABERTA_FIXTURE],
        refreshing: true,
      });

      render(<HomeScreen />);

      expect(screen.getByTestId("home-scroll-view")).toBeTruthy();
    });

    it("chama onRefresh ao disparar o evento de refresh no ScrollView", () => {
      setupHomeVagas({ loading: false, vagas: [VAGA_ABERTA_FIXTURE] });

      render(<HomeScreen />);

      const scrollView = screen.getByTestId("home-scroll-view");
      const { refreshControl } = scrollView.props;

      expect(refreshControl).toBeDefined();
      refreshControl.props.onRefresh();

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
