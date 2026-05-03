import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import MeusDadosScreen from "@/app/(home)/meus-dados";
import { CepNotFoundError } from "@/services/viacep";

// ─── Mocks de contexto e serviços ────────────────────────────────────────────

const mockRouterBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockRouterBack, push: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockUseAuth = jest.fn();
jest.mock("@/context/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();
jest.mock("@/services/auth.service", () => ({
  authService: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  },
}));

const mockGetBarsById = jest.fn();
const mockGetCasaById = jest.fn();
const mockUpdateBars = jest.fn();
const mockUpdateCasa = jest.fn();
const mockUpdateBarsImages = jest.fn();
jest.mock("@/services/contractor.service", () => ({
  contractorService: {
    getBarsById: (...args: unknown[]) => mockGetBarsById(...args),
    getCasaById: (...args: unknown[]) => mockGetCasaById(...args),
    updateBars: (...args: unknown[]) => mockUpdateBars(...args),
    updateCasa: (...args: unknown[]) => mockUpdateCasa(...args),
    updateBarsImages: (...args: unknown[]) => mockUpdateBarsImages(...args),
  },
}));

const mockFetchAddressByCep = jest.fn();
jest.mock("@/services/viacep", () => ({
  fetchAddressByCep: (...args: unknown[]) => mockFetchAddressByCep(...args),
  CepNotFoundError: class CepNotFoundError extends Error {
    constructor() {
      super("CEP não encontrado");
      this.name = "CepNotFoundError";
    }
  },
}));

jest.mock("@/utils/toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseBarsUser = {
  id: "user-1",
  name: "Bar do Zé",
  email: "ze@bar.com",
  phone: "(11) 99999-9999",
  module: "bars-restaurants",
  contractorId: "contractor-1",
  profileCompleted: true,
  userType: "contractor",
  avatarUrl: null,
};

const baseCasaUser = {
  id: "user-2",
  name: "Maria Casa",
  email: "maria@casa.com",
  phone: "(21) 98888-0000",
  module: "home-services",
  contractorId: "contractor-2",
  profileCompleted: true,
  userType: "contractor",
  avatarUrl: null,
};

const profileResponse = {
  data: {
    name: "Bar do Zé",
    email: "ze@bar.com",
    phone: "(11) 99999-9999",
  },
};

const barsContractorResponse = {
  data: {
    companyName: "Zé Boteco LTDA",
    corporateReason: "Zé Boteco Comércio LTDA",
    segment: "Bar",
    cnpj: "12345678000199",
    document: null,
    contactName: "José Silva",
    contactPhone: "11999999999",
    establishmentFacadeImage: null,
    establishmentInteriorImage: null,
  },
};

const casaContractorResponse = {
  data: {
    document: "123.456.789-00",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setupBarsUser() {
  mockUseAuth.mockReturnValue({ user: baseBarsUser });
  mockGetProfile.mockResolvedValue(profileResponse);
  mockGetBarsById.mockResolvedValue(barsContractorResponse);
}

function setupCasaUser() {
  mockUseAuth.mockReturnValue({ user: baseCasaUser });
  mockGetProfile.mockResolvedValue({ data: { name: "Maria Casa", email: "maria@casa.com", phone: "" } });
  mockGetCasaById.mockResolvedValue(casaContractorResponse);
}

async function renderAndWaitLoad() {
  render(<MeusDadosScreen />);
  await waitFor(() => {
    expect(screen.queryByTestId("loading-indicator")).toBeNull();
  });
}

function switchTab(label: string) {
  fireEvent.press(screen.getByText(label));
}

// ─── Testes ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MeusDadosScreen — loading state", () => {
  it("1. exibe ActivityIndicator enquanto isLoadingData = true", async () => {
    // getProfile nunca resolve durante este teste
    mockUseAuth.mockReturnValue({ user: baseBarsUser });
    mockGetProfile.mockReturnValue(new Promise(() => {}));

    render(<MeusDadosScreen />);

    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
  });
});

describe("MeusDadosScreen — renderização após carga", () => {
  it("2. exibe título do header após carregamento", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    expect(screen.getByText("Perfil do Estabelecimento")).toBeTruthy();
  });

  it("2b. exibe o nome do usuário pré-preenchido no campo Nome", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    const nameInput = screen.getByDisplayValue("Bar do Zé");
    expect(nameInput).toBeTruthy();
  });

  it("2c. exibe o e-mail do usuário como campo somente-leitura", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    expect(screen.getByText("ze@bar.com")).toBeTruthy();
  });

  it("2d. exibe seção Dados do Estabelecimento ao navegar para aba Estabelecimento", async () => {
    setupBarsUser();
    await renderAndWaitLoad();
    switchTab("Estabelecimento");

    expect(screen.getByText("Dados do Estabelecimento")).toBeTruthy();
  });

  it("2d2. pré-preenche companyName, corporateReason e segment com dados da API", async () => {
    setupBarsUser();
    await renderAndWaitLoad();
    switchTab("Estabelecimento");

    expect(screen.getByDisplayValue("Zé Boteco LTDA")).toBeTruthy();
    expect(screen.getByDisplayValue("Zé Boteco Comércio LTDA")).toBeTruthy();
    expect(screen.getByDisplayValue("Bar")).toBeTruthy();
  });

  it("2d3. exibe CNPJ formatado como campo somente-leitura", async () => {
    setupBarsUser();
    await renderAndWaitLoad();
    switchTab("Estabelecimento");

    expect(screen.getByText("12345678000199")).toBeTruthy();
  });

  it("2d4. exibe contactName e contactPhone no responsável pela operação", async () => {
    setupBarsUser();
    await renderAndWaitLoad();
    switchTab("Estabelecimento");

    expect(screen.getByText("José Silva")).toBeTruthy();
    expect(screen.getByText("11999999999")).toBeTruthy();
  });

  it("2e. NÃO exibe conteúdo de Endereço na aba padrão para bars-restaurants", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    expect(screen.queryByPlaceholderText("00000-000")).toBeNull();
  });

  it("2f. exibe seção de Endereço na aba Endereço para módulo home-services", async () => {
    setupCasaUser();
    await renderAndWaitLoad();
    switchTab("Endereço");

    expect(screen.getByPlaceholderText("00000-000")).toBeTruthy();
  });

  it("2g. NÃO exibe Dados do Estabelecimento para módulo home-services", async () => {
    setupCasaUser();
    await renderAndWaitLoad();

    expect(screen.queryByText("Dados do Estabelecimento")).toBeNull();
  });
});

describe("MeusDadosScreen — navegação", () => {
  it("3. botão voltar (chevron) chama router.back()", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    const backButton = screen.getByTestId("back-button");
    fireEvent.press(backButton);

    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
});

describe("MeusDadosScreen — edição de campo", () => {
  it("4. campo Nome pode ser editado pelo usuário", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    const nameInput = screen.getByDisplayValue("Bar do Zé");
    fireEvent.changeText(nameInput, "Novo Nome do Bar");

    expect(screen.getByDisplayValue("Novo Nome do Bar")).toBeTruthy();
  });
});

describe("MeusDadosScreen — salvar informações do usuário", () => {
  it("5. botão Salvar Informações chama authService.updateProfile com o nome atual", async () => {
    setupBarsUser();
    mockUpdateProfile.mockResolvedValue({});
    await renderAndWaitLoad();

    const saveButton = screen.getByText("Salvar Informações");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ name: "Bar do Zé" });
    });
  });

  it("5b. exibe erro de validação quando nome tem menos de 3 caracteres", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    const nameInput = screen.getByDisplayValue("Bar do Zé");
    fireEvent.changeText(nameInput, "AB");

    const saveButton = screen.getByText("Salvar Informações");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Nome deve ter ao menos 3 caracteres")).toBeTruthy();
    });

    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("5c. não chama updateProfile quando nome está vazio e exibe erro de validação", async () => {
    setupBarsUser();
    await renderAndWaitLoad();

    const nameInput = screen.getByDisplayValue("Bar do Zé");
    fireEvent.changeText(nameInput, "");

    const saveButton = screen.getByText("Salvar Informações");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // yup executa validação assíncrona; aguardamos mensagem de nome curto ou obrigatório
    await waitFor(() => {
      const nameErr =
        screen.queryByText("Nome é obrigatório") ||
        screen.queryByText("Nome deve ter ao menos 3 caracteres");
      expect(nameErr).toBeTruthy();
    });

    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("8. botão exibe ActivityIndicator durante o save (loading state)", async () => {
    setupBarsUser();

    let resolveUpdate: (value: unknown) => void;
    const pendingUpdate = new Promise((resolve) => {
      resolveUpdate = resolve;
    });
    mockUpdateProfile.mockReturnValue(pendingUpdate);

    await renderAndWaitLoad();

    const saveButton = screen.getByText("Salvar Informações");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Salvar Informações")).toBeNull();
    });

    // resolve para limpar pendência
    await act(async () => {
      resolveUpdate({});
    });
  });
});

describe("MeusDadosScreen — busca de CEP", () => {
  it("6. preenche campos de endereço automaticamente ao digitar CEP válido", async () => {
    setupCasaUser();
    mockFetchAddressByCep.mockResolvedValue({
      logradouro: "Rua das Flores",
      bairro: "Centro",
      localidade: "São Paulo",
      uf: "SP",
    });
    await renderAndWaitLoad();
    switchTab("Endereço");

    const cepInput = screen.getByPlaceholderText("00000-000");
    await act(async () => {
      fireEvent.changeText(cepInput, "01310100");
    });

    await waitFor(() => {
      expect(mockFetchAddressByCep).toHaveBeenCalledWith("01310100");
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Rua das Flores")).toBeTruthy();
      expect(screen.getByDisplayValue("Centro")).toBeTruthy();
      expect(screen.getByDisplayValue("São Paulo")).toBeTruthy();
      expect(screen.getByDisplayValue("SP")).toBeTruthy();
    });
  });

  it("6b. NÃO busca CEP quando há menos de 8 dígitos", async () => {
    setupCasaUser();
    await renderAndWaitLoad();
    switchTab("Endereço");

    const cepInput = screen.getByPlaceholderText("00000-000");
    await act(async () => {
      fireEvent.changeText(cepInput, "0131010");
    });

    expect(mockFetchAddressByCep).not.toHaveBeenCalled();
  });

  it("7. exibe mensagem de erro quando CEP não é encontrado", async () => {
    setupCasaUser();
    mockFetchAddressByCep.mockRejectedValue(new CepNotFoundError());
    await renderAndWaitLoad();
    switchTab("Endereço");

    const cepInput = screen.getByPlaceholderText("00000-000");
    await act(async () => {
      fireEvent.changeText(cepInput, "99999999");
    });

    await waitFor(() => {
      expect(screen.getByText("CEP não encontrado")).toBeTruthy();
    });
  });

  it("7b. exibe mensagem genérica para erro de rede na busca de CEP", async () => {
    setupCasaUser();
    mockFetchAddressByCep.mockRejectedValue(new Error("Network Error"));
    await renderAndWaitLoad();
    switchTab("Endereço");

    const cepInput = screen.getByPlaceholderText("00000-000");
    await act(async () => {
      fireEvent.changeText(cepInput, "01310100");
    });

    await waitFor(() => {
      expect(screen.getByText("Erro ao buscar CEP")).toBeTruthy();
    });
  });

  it("7c. limpa mensagem de erro de CEP ao digitar novo valor", async () => {
    setupCasaUser();
    mockFetchAddressByCep.mockRejectedValue(new CepNotFoundError());
    await renderAndWaitLoad();
    switchTab("Endereço");

    const cepInput = screen.getByPlaceholderText("00000-000");

    await act(async () => {
      fireEvent.changeText(cepInput, "99999999");
    });
    await waitFor(() => {
      expect(screen.getByText("CEP não encontrado")).toBeTruthy();
    });

    // digita novo valor — erro deve sumir
    await act(async () => {
      fireEvent.changeText(cepInput, "0131010");
    });
    expect(screen.queryByText("CEP não encontrado")).toBeNull();
  });
});

describe("MeusDadosScreen — salvar endereço", () => {
  it("salva endereço chamando contractorService.updateCasa com dados corretos", async () => {
    setupCasaUser();
    mockFetchAddressByCep.mockResolvedValue({
      logradouro: "Rua das Flores",
      bairro: "Centro",
      localidade: "São Paulo",
      uf: "SP",
    });
    mockUpdateCasa.mockResolvedValue({});
    await renderAndWaitLoad();
    switchTab("Endereço");

    const cepInput = screen.getByPlaceholderText("00000-000");
    await act(async () => {
      fireEvent.changeText(cepInput, "01310100");
    });
    await waitFor(() => expect(screen.getByDisplayValue("Rua das Flores")).toBeTruthy());

    const numberInput = screen.getByPlaceholderText("123");
    fireEvent.changeText(numberInput, "42");

    const saveAddressButton = screen.getByText("Salvar Endereço");
    await act(async () => {
      fireEvent.press(saveAddressButton);
    });

    await waitFor(() => {
      expect(mockUpdateCasa).toHaveBeenCalledWith(
        expect.objectContaining({
          street: "Rua das Flores",
          neighborhood: "Centro",
          city: "São Paulo",
          uf: "SP",
          number: "42",
          cep: "01310100",
        })
      );
    });
  });
});

describe("MeusDadosScreen — salvar dados do estabelecimento (bars)", () => {
  it("salva dados chamando contractorService.updateBars", async () => {
    setupBarsUser();
    mockUpdateBars.mockResolvedValue({});
    await renderAndWaitLoad();
    switchTab("Estabelecimento");

    const companyNameInput = screen.getByDisplayValue("Zé Boteco LTDA");
    fireEvent.changeText(companyNameInput, "Novo Nome LTDA");

    const saveButton = screen.getByText("Salvar Alterações");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(mockUpdateBars).toHaveBeenCalledWith(
        expect.objectContaining({ companyName: "Novo Nome LTDA" })
      );
    });
  });
});

describe("MeusDadosScreen — error state no carregamento inicial", () => {
  it("exibe toast de erro quando getProfile falha", async () => {
    const { toast } = require("@/utils/toast");
    mockUseAuth.mockReturnValue({ user: baseBarsUser });
    mockGetProfile.mockRejectedValue(new Error("Server Error"));

    render(<MeusDadosScreen />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Não foi possível carregar seus dados.",
        "Tente novamente."
      );
    });
  });
});
