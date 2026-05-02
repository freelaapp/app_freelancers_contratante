import { candidaturasService } from "@/services/candidaturas.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: { get: jest.fn(), patch: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

describe("candidaturasService.listByVacancy", () => {
  it("deve chamar GET com o vacancyId na URL", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/bars-restaurants/candidacies/vacancies/vacancy-1"
    );
    expect(result).toEqual([]);
  });

  it("deve retornar a lista de candidatos", async () => {
    const candidatos = [{ id: "c1", name: "João" }];
    mockApi.get.mockResolvedValueOnce({ data: candidatos });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result).toEqual(candidatos);
  });
});

describe("candidaturasService.accept", () => {
  it("deve chamar PATCH no endpoint de accept com candidacyId", async () => {
    mockApi.patch.mockResolvedValueOnce({ data: {} });

    await candidaturasService.accept("candidacy-1");

    expect(mockApi.patch).toHaveBeenCalledWith(
      "/v1/bars-restaurants/candidacies/accept",
      { candidacyId: "candidacy-1" }
    );
  });
});

describe("candidaturasService.reject", () => {
  it("deve chamar PATCH no endpoint de reject com candidacyId", async () => {
    mockApi.patch.mockResolvedValueOnce({ data: {} });

    await candidaturasService.reject("candidacy-1");

    expect(mockApi.patch).toHaveBeenCalledWith(
      "/v1/bars-restaurants/candidacies/reject",
      { candidacyId: "candidacy-1" }
    );
  });
});
