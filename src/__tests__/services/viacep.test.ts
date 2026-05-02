import { fetchAddressByCep, CepNotFoundError, ViaCepResponse } from "@/services/viacep";

const mockGet = jest.fn();

jest.mock("axios", () => {
  const mockGetFn = jest.fn();
  (global as Record<string, unknown>).__axiosMockGet = mockGetFn;
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => ({ get: mockGetFn })),
    },
  };
});

const mockAddress: ViaCepResponse = {
  cep: "01001-000",
  logradouro: "Praça da Sé",
  complemento: "lado ímpar",
  bairro: "Sé",
  localidade: "São Paulo",
  uf: "SP",
  ibge: "3550308",
  gia: "1004",
  ddd: "11",
  siafi: "7107",
};

function getAxiosMockGet(): jest.Mock {
  return (global as Record<string, unknown>).__axiosMockGet as jest.Mock;
}

beforeEach(() => {
  getAxiosMockGet().mockReset();
});

describe("fetchAddressByCep", () => {
  it("deve retornar endereço com campos corretos quando CEP é válido", async () => {
    getAxiosMockGet().mockResolvedValueOnce({ data: mockAddress });

    const result = await fetchAddressByCep("01001000");

    expect(result.logradouro).toBe("Praça da Sé");
    expect(result.bairro).toBe("Sé");
    expect(result.localidade).toBe("São Paulo");
    expect(result.uf).toBe("SP");
  });

  it("deve lançar CepNotFoundError quando resposta contém erro: true", async () => {
    getAxiosMockGet().mockResolvedValueOnce({ data: { ...mockAddress, erro: true } });

    await expect(fetchAddressByCep("99999999")).rejects.toBeInstanceOf(CepNotFoundError);
  });

  it("deve lançar Error genérico (não CepNotFoundError) quando axios lança erro de rede", async () => {
    getAxiosMockGet().mockRejectedValueOnce(new Error("Network Error"));

    await expect(fetchAddressByCep("01001000")).rejects.toThrow("Network Error");
  });

  it("deve limpar a formatação do CEP e chamar o endpoint com apenas dígitos", async () => {
    getAxiosMockGet().mockResolvedValueOnce({ data: mockAddress });

    await fetchAddressByCep("01001-000");

    expect(getAxiosMockGet()).toHaveBeenCalledWith("/01001000/json/");
  });

  it("deve lançar Error quando CEP tem comprimento inválido após limpeza", async () => {
    await expect(fetchAddressByCep("0100")).rejects.toThrow("CEP inválido");
    expect(getAxiosMockGet()).not.toHaveBeenCalled();
  });
});
