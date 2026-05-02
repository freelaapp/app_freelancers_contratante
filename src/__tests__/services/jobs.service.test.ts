import { jobsService } from "@/services/jobs.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

describe("jobsService.getByVacancy", () => {
  it("deve chamar GET com vacancyId na URL", async () => {
    const job = { id: "job-1", status: "scheduled" };
    mockApi.get.mockResolvedValueOnce({ data: job });

    const result = await jobsService.getByVacancy("vacancy-1");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/bars-restaurants/jobs/by-vacancy/vacancy-1"
    );
    expect(result).toEqual(job);
  });
});

describe("jobsService.generateCheckinCode", () => {
  it("deve chamar POST com jobId e retornar o código quando resposta é objeto", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { code: "ABC123" } });

    const result = await jobsService.generateCheckinCode("job-1");

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/bars-restaurants/contractors/jobs/check-ins/code",
      { jobId: "job-1" }
    );
    expect(result).toBe("ABC123");
  });

  it("deve retornar o código quando resposta é string direta", async () => {
    mockApi.post.mockResolvedValueOnce({ data: "XYZ789" });

    const result = await jobsService.generateCheckinCode("job-1");

    expect(result).toBe("XYZ789");
  });
});

describe("jobsService.generateCheckoutCode", () => {
  it("deve chamar POST com jobId e retornar o código quando resposta é objeto", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { code: "DEF456" } });

    const result = await jobsService.generateCheckoutCode("job-1");

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/bars-restaurants/contractors/jobs/check-outs/code",
      { jobId: "job-1" }
    );
    expect(result).toBe("DEF456");
  });

  it("deve retornar o código quando resposta é string direta", async () => {
    mockApi.post.mockResolvedValueOnce({ data: "GHI012" });

    const result = await jobsService.generateCheckoutCode("job-1");

    expect(result).toBe("GHI012");
  });
});
