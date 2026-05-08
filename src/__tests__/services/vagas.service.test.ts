import { vagasService, CreateVagaPayload } from "@/services/vagas.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

describe("vagasService.listByContractor", () => {
  it("deve chamar GET com o module bars-restaurants e contractorId na URL", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    const result = await vagasService.listByContractor("bars-restaurants", "contractor-1");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/bars-restaurants/vacancies/contractors/contractor-1"
    );
    expect(result).toEqual([]);
  });

  it("deve chamar GET com o module home-services e contractorId na URL", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    await vagasService.listByContractor("home-services", "contractor-2");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/home-services/vacancies/contractors/contractor-2"
    );
  });

  it("deve retornar a lista de vagas", async () => {
    const vagas = [{ id: "v1", title: "Garçom" }, { id: "v2", title: "Bartender" }];
    mockApi.get.mockResolvedValueOnce({ data: vagas });

    const result = await vagasService.listByContractor("bars-restaurants", "contractor-1");

    expect(result).toEqual(vagas);
  });
});

describe("vagasService.create", () => {
  it("deve chamar POST no endpoint correto com o payload completo", async () => {
    const vagaCriada = { id: "v-new", title: "GARÇOM/GARÇONETE", status: "OPEN" };
    mockApi.post.mockResolvedValueOnce({ data: vagaCriada });

    const payload: CreateVagaPayload = {
      title: "Garçom/Garçonete",
      description: "Evento de casamento",
      serviceType: "GARÇOM/GARÇONETE",
      date: "2026-03-20",
      startTime: "2026-03-20T21:00:00.000Z",
      endTime: "2026-03-21T02:00:00.000Z",
      address: "Rua X, 123, Centro, São Paulo/SP",
      cityId: "São Paulo",
    };

    const result = await vagasService.create("bars-restaurants", payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/bars-restaurants/vacancies",
      payload
    );
    expect(result).toEqual(vagaCriada);
  });

  it("deve chamar POST sem cityId quando não informado", async () => {
    const vagaCriada = { id: "v-new2", title: "BARISTA", status: "OPEN" };
    mockApi.post.mockResolvedValueOnce({ data: vagaCriada });

    const payload: CreateVagaPayload = {
      title: "Barista",
      description: "Evento no estabelecimento",
      serviceType: "BARISTA",
      date: "2026-04-10",
      startTime: "2026-04-10T14:00:00.000Z",
      endTime: "2026-04-10T20:00:00.000Z",
    };

    const result = await vagasService.create("home-services", payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/home-services/vacancies",
      payload
    );
    expect(result).toEqual(vagaCriada);
    expect(payload.cityId).toBeUndefined();
  });
});

describe("vagasService.getById", () => {
  it("deve chamar GET com o module bars-restaurants e id da vaga na URL", async () => {
    const vaga = { id: "v1", title: "Garçom", candidacies: [] };
    mockApi.get.mockResolvedValueOnce({ data: vaga });

    const result = await vagasService.getById("bars-restaurants", "v1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/bars-restaurants/vacancies/v1");
    expect(result).toEqual(vaga);
  });

  it("deve chamar GET com o module home-services e id da vaga na URL", async () => {
    const vaga = { id: "v2", title: "Eletricista", candidacies: [] };
    mockApi.get.mockResolvedValueOnce({ data: vaga });

    const result = await vagasService.getById("home-services", "v2");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/home-services/vacancies/v2");
    expect(result).toEqual(vaga);
  });
});
