import { vagasService } from "@/services/vagas.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: { get: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

describe("vagasService.listByContractor", () => {
  it("deve chamar GET com o contractorId na URL", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    const result = await vagasService.listByContractor("contractor-1");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/bars-restaurants/vacancies/contractors/contractor-1"
    );
    expect(result).toEqual([]);
  });

  it("deve retornar a lista de vagas", async () => {
    const vagas = [{ id: "v1", title: "Garçom" }, { id: "v2", title: "Bartender" }];
    mockApi.get.mockResolvedValueOnce({ data: vagas });

    const result = await vagasService.listByContractor("contractor-1");

    expect(result).toEqual(vagas);
  });
});

describe("vagasService.getById", () => {
  it("deve chamar GET com o id da vaga na URL", async () => {
    const vaga = { id: "v1", title: "Garçom", candidacies: [] };
    mockApi.get.mockResolvedValueOnce({ data: vaga });

    const result = await vagasService.getById("v1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/bars-restaurants/vacancies/v1");
    expect(result).toEqual(vaga);
  });
});
