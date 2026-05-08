import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import ExploreScreen from "@/app/(home)/explore";
import { vagasService } from "@/services/vagas.service";

const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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
    list: jest.fn(),
  },
}));

const mockVagasService = vagasService as jest.Mocked<typeof vagasService>;

const MOCK_VAGAS = [
  {
    id: "vaga-1",
    title: "Garçom para evento",
    status: "open",
    location: "São Paulo, SP",
    date: "2026-06-01T00:00:00.000Z",
    startTime: "2026-06-01T18:00:00.000Z",
    serviceType: "Garçom/Garçonete",
    chargeAmountInCents: 15000,
  },
  {
    id: "vaga-2",
    title: "Barman para festa",
    status: "pending",
    location: "Rio de Janeiro, RJ",
    date: "2026-06-05T00:00:00.000Z",
    startTime: "2026-06-05T20:00:00.000Z",
    serviceType: "Barman/Bartender",
    chargeAmountInCents: 20000,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ExploreScreen", () => {
  it("renderiza a tela sem erros (smoke test)", async () => {
    mockVagasService.list.mockResolvedValueOnce([]);

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByText("Explorar Vagas")).toBeTruthy();
    });
  });

  it("exibe loading indicator enquanto carrega", () => {
    mockVagasService.list.mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<ExploreScreen />);

    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
  });

  it("exibe vagas retornadas pela API", async () => {
    mockVagasService.list.mockResolvedValueOnce(MOCK_VAGAS);

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByText("Garçom para evento")).toBeTruthy();
      expect(screen.getByText("Barman para festa")).toBeTruthy();
    });
  });

  it("exibe estado vazio quando API retorna lista vazia", async () => {
    mockVagasService.list.mockResolvedValueOnce([]);

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByText("Nenhuma vaga encontrada")).toBeTruthy();
    });
  });

  it("filtra vagas localmente pela barra de pesquisa", async () => {
    mockVagasService.list.mockResolvedValueOnce(MOCK_VAGAS);

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByText("Garçom para evento")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("search-input"), "Barman");

    await waitFor(() => {
      expect(screen.queryByText("Garçom para evento")).toBeNull();
      expect(screen.getByText("Barman para festa")).toBeTruthy();
    });
  });

  it("exibe estado vazio ao pesquisar termo sem resultado", async () => {
    mockVagasService.list.mockResolvedValueOnce(MOCK_VAGAS);

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByText("Garçom para evento")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("search-input"), "xyztermoquenoexiste");

    await waitFor(() => {
      expect(screen.getByText("Nenhuma vaga encontrada")).toBeTruthy();
    });
  });

  it("pull-to-refresh chama a API novamente", async () => {
    mockVagasService.list
      .mockResolvedValueOnce(MOCK_VAGAS)
      .mockResolvedValueOnce(MOCK_VAGAS);

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(mockVagasService.list).toHaveBeenCalledTimes(1);
    });

    const refreshControl = screen.UNSAFE_getByType(
      require("react-native").RefreshControl
    );

    fireEvent(refreshControl, "refresh");

    await waitFor(() => {
      expect(mockVagasService.list).toHaveBeenCalledTimes(2);
    });
  });

  it("exibe mensagem de erro quando API falha", async () => {
    mockVagasService.list.mockRejectedValueOnce(new Error("Network error"));

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeTruthy();
    });
  });

  it("botão de retry chama a API novamente após erro", async () => {
    mockVagasService.list
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(MOCK_VAGAS);

    render(<ExploreScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("retry-button")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("retry-button"));

    await waitFor(() => {
      expect(mockVagasService.list).toHaveBeenCalledTimes(2);
    });
  });
});
