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

  it("deve retornar candidatos com dados embedded quando não há providerId nem candidacy com providerGlobalId", async () => {
    const candidatos = [{ id: "c1", name: "João", role: "Garçom" }];
    mockApi.get
      .mockResolvedValueOnce({ data: candidatos })
      .mockResolvedValueOnce({ data: { id: "c1", providerGlobalId: null, status: "PENDING" } });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result[0]).toMatchObject({ id: "c1", name: "João", role: "Garçom" });
  });

  it("deve enriquecer candidato com perfil do provider quando providerGlobalId está disponível na candidatura lista", async () => {
    const candidatos = [{ id: "c1", providerGlobalId: "prov-global-1" }];
    const providerProfile = {
      id: "prov-global-1",
      name: "Maria",
      averageRating: 4.5,
      completedJobsCount: 10,
      profile: { jobTitle: "Bartender", avatarUrl: "https://cdn.example.com/avatar.jpg" },
    };

    mockApi.get
      .mockResolvedValueOnce({ data: candidatos })
      .mockResolvedValueOnce({ data: providerProfile });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result[0]).toMatchObject({
      id: "c1",
      name: "Maria",
      role: "Bartender",
      rating: 4.5,
      jobCount: 10,
      avatarUrl: "https://cdn.example.com/avatar.jpg",
    });
    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/users/providers/prov-global-1",
      { _suppressToast: true }
    );
  });

  it("deve usar fetchProviderProfileByCandidacyId como fallback quando não há providerId direto", async () => {
    const candidatos = [{ id: "c1", name: "Carlos" }];
    const candidacyDetail = { id: "c1", providerGlobalId: "prov-global-2", status: "PENDING" };
    const providerProfile = {
      id: "prov-global-2",
      name: "Carlos Silva",
      averageRating: 3.8,
      completedJobsCount: 5,
      profile: { jobTitle: "Cozinheiro", avatarUrl: "https://cdn.example.com/carlos.jpg" },
    };

    mockApi.get
      .mockResolvedValueOnce({ data: candidatos })
      .mockResolvedValueOnce({ data: candidacyDetail })
      .mockResolvedValueOnce({ data: providerProfile });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result[0]).toMatchObject({
      id: "c1",
      name: "Carlos Silva",
      role: "Cozinheiro",
      avatarUrl: "https://cdn.example.com/carlos.jpg",
    });
    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/bars-restaurants/candidacies/c1",
      { _suppressToast: true }
    );
    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/users/providers/prov-global-2",
      { _suppressToast: true }
    );
  });

  it("deve retornar dados embedded quando fetchProviderProfileByCandidacyId retorna providerGlobalId null", async () => {
    const candidatos = [{ id: "c1", name: "Pedro", role: "Auxiliar" }];
    const candidacyDetail = { id: "c1", providerGlobalId: null, status: "PENDING" };

    mockApi.get
      .mockResolvedValueOnce({ data: candidatos })
      .mockResolvedValueOnce({ data: candidacyDetail });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result[0]).toMatchObject({ id: "c1", name: "Pedro", role: "Auxiliar" });
  });

  it("deve retornar dados embedded quando fetchProviderProfileByCandidacyId falha com erro", async () => {
    const candidatos = [{ id: "c1", name: "Ana", role: "Atendente" }];

    mockApi.get
      .mockResolvedValueOnce({ data: candidatos })
      .mockRejectedValueOnce(new Error("Network error"));

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result[0]).toMatchObject({ id: "c1", name: "Ana", role: "Atendente" });
  });

  it("deve usar fallback de id gerado quando candidatura não tem id", async () => {
    const candidatos = [{ name: "Sem ID" }];
    const candidacyDetail = { id: "candidato-0", providerGlobalId: null, status: "PENDING" };

    mockApi.get
      .mockResolvedValueOnce({ data: candidatos })
      .mockResolvedValueOnce({ data: candidacyDetail });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result[0].id).toBe("candidato-0");
  });

  it("deve desembrulhar candidaturas com wrapper props", async () => {
    const candidatos = [{ props: { id: "c1", providerGlobalId: "prov-1", name: "Wrapper" } }];
    const providerProfile = {
      id: "prov-1",
      name: "Wrapper Profile",
      profile: { jobTitle: "Sommelier", avatarUrl: "https://cdn.example.com/w.jpg" },
    };

    mockApi.get
      .mockResolvedValueOnce({ data: candidatos })
      .mockResolvedValueOnce({ data: providerProfile });

    const result = await candidaturasService.listByVacancy("vacancy-1");

    expect(result[0]).toMatchObject({
      id: "c1",
      name: "Wrapper Profile",
      role: "Sommelier",
      avatarUrl: "https://cdn.example.com/w.jpg",
    });
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
