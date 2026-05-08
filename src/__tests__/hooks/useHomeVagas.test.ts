import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useHomeVagas } from "@/hooks/useHomeVagas";
import { vagasService } from "@/services/vagas.service";
import { clearOptimisticVagas } from "@/utils/optimistic-vagas-store";
import type { VagaApi } from "@/types/vagas";

jest.mock("@/services/vagas.service", () => ({
  vagasService: {
    listByContractor: jest.fn(),
  },
}));

jest.mock("@/utils/toast", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/utils/debug", () => ({
  debug: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockListByContractor = vagasService.listByContractor as jest.Mock;

const USER_FIXTURE = {
  id: "user-1",
  module: "bars-restaurants" as const,
  contractorId: "contractor-123",
};

jest.mock("@/context/auth-context", () => ({
  useAuth: () => ({ user: USER_FIXTURE }),
}));

const VAGA_API: VagaApi = {
  id: "vaga-api-1",
  title: "Garçom para evento",
  status: "open",
  date: "2099-12-31",
};

const VAGA_OTIMISTA: VagaApi = {
  id: "vaga-nova-1",
  title: "Nova vaga recém-criada",
  status: "open",
  date: "2099-12-31",
};

beforeEach(() => {
  jest.clearAllMocks();
  clearOptimisticVagas();
  mockListByContractor.mockResolvedValue([VAGA_API]);
});

describe("useHomeVagas", () => {
  describe("fetchVagas", () => {
    it("carrega vagas da API e atualiza o estado", async () => {
      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.vagas).toEqual([VAGA_API]);
    });

    it("define loading como false após o fetch concluir", async () => {
      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it("define vagas como array vazio quando API retorna null/undefined", async () => {
      mockListByContractor.mockResolvedValue(null);

      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.vagas).toEqual([]);
    });
  });

  describe("addVaga — otimismo local", () => {
    it("adiciona vaga ao início da lista imediatamente", async () => {
      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addVaga(VAGA_OTIMISTA);
      });

      expect(result.current.vagas[0]).toEqual(VAGA_OTIMISTA);
      expect(result.current.vagas).toHaveLength(2);
    });

    it("não duplica a vaga se ela já existe na lista", async () => {
      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addVaga(VAGA_OTIMISTA);
        result.current.addVaga(VAGA_OTIMISTA);
      });

      expect(result.current.vagas.filter((v) => v.id === VAGA_OTIMISTA.id)).toHaveLength(1);
    });
  });

  describe("Bug: vaga otimista some no onRefresh (race condition)", () => {
    it("preserva vaga otimista no onRefresh quando a API ainda não a retorna", async () => {
      mockListByContractor.mockResolvedValue([VAGA_API]);

      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addVaga(VAGA_OTIMISTA);
      });

      expect(result.current.vagas.some((v) => v.id === VAGA_OTIMISTA.id)).toBe(true);

      mockListByContractor.mockResolvedValue([VAGA_API]);

      await act(async () => {
        result.current.onRefresh();
        await waitFor(() => expect(result.current.refreshing).toBe(false));
      });

      expect(result.current.vagas.some((v) => v.id === VAGA_OTIMISTA.id)).toBe(true);
    });

    it("remove vaga otimista do buffer quando a API passa a retorná-la", async () => {
      mockListByContractor.mockResolvedValue([VAGA_API]);

      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addVaga(VAGA_OTIMISTA);
      });

      mockListByContractor.mockResolvedValue([VAGA_API, VAGA_OTIMISTA]);

      await act(async () => {
        result.current.onRefresh();
        await waitFor(() => expect(result.current.refreshing).toBe(false));
      });

      const occurrences = result.current.vagas.filter((v) => v.id === VAGA_OTIMISTA.id);
      expect(occurrences).toHaveLength(1);
    });

    it("preserva vaga otimista no fetchVagas quando a API ainda não a retorna", async () => {
      mockListByContractor.mockResolvedValue([VAGA_API]);

      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addVaga(VAGA_OTIMISTA);
      });

      mockListByContractor.mockResolvedValue([VAGA_API]);

      await act(async () => {
        await result.current.fetchVagas();
      });

      expect(result.current.vagas.some((v) => v.id === VAGA_OTIMISTA.id)).toBe(true);
    });

    it("preserva vaga otimista após remount do componente (store de módulo)", async () => {
      mockListByContractor.mockResolvedValue([VAGA_API]);

      // Primeira instância — simula home screen inicial
      const { result: r1, unmount } = renderHook(() => useHomeVagas());
      await waitFor(() => expect(r1.current.loading).toBe(false));
      act(() => { r1.current.addVaga(VAGA_OTIMISTA); });
      unmount(); // home desmonta (navegação)

      // Segunda instância — simula remount após voltar de criar-vaga
      const { result: r2 } = renderHook(() => useHomeVagas());
      await waitFor(() => expect(r2.current.loading).toBe(false));

      // Vaga deve continuar visível mesmo após remount
      expect(r2.current.vagas.some((v) => v.id === VAGA_OTIMISTA.id)).toBe(true);
    });
  });

  describe("onRefresh", () => {
    it("define refreshing como false após o refresh concluir com sucesso", async () => {
      mockListByContractor.mockResolvedValue([VAGA_API]);

      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.onRefresh();
      });

      await waitFor(() => expect(result.current.refreshing).toBe(false));

      expect(result.current.vagas).toEqual([VAGA_API]);
    });

    it("atualiza a lista de vagas após o refresh", async () => {
      const VAGA_NOVA: VagaApi = { id: "vaga-2", title: "Barman", status: "open" };
      mockListByContractor
        .mockResolvedValueOnce([VAGA_API])
        .mockResolvedValueOnce([VAGA_API, VAGA_NOVA]);

      const { result } = renderHook(() => useHomeVagas());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.onRefresh();
      });

      await waitFor(() => expect(result.current.refreshing).toBe(false));

      expect(result.current.vagas).toHaveLength(2);
      expect(result.current.vagas.some((v) => v.id === VAGA_NOVA.id)).toBe(true);
    });
  });
});
