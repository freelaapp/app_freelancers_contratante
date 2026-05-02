import { feedbacksService } from "@/services/feedbacks.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

describe("feedbacksService.create", () => {
  it("deve chamar POST com payload correto", async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    await feedbacksService.create({ jobId: "job-1", rating: 5, comment: "Ótimo!" });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/bars-restaurants/contractors/jobs/feedbacks",
      { jobId: "job-1", rating: 5, comment: "Ótimo!" }
    );
  });

  it("deve funcionar sem comment opcional", async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    await feedbacksService.create({ jobId: "job-1", rating: 4 });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/bars-restaurants/contractors/jobs/feedbacks",
      { jobId: "job-1", rating: 4 }
    );
  });
});

describe("feedbacksService.listByContractor", () => {
  it("deve chamar GET com contractorId na URL", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    const result = await feedbacksService.listByContractor("contractor-1");

    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/bars-restaurants/contractors/contractor-1/jobs/feedbacks"
    );
    expect(result).toEqual([]);
  });

  it("deve retornar a lista de feedbacks", async () => {
    const feedbacks = [{ id: "f1", rating: 5, comment: "Excelente" }];
    mockApi.get.mockResolvedValueOnce({ data: feedbacks });

    const result = await feedbacksService.listByContractor("contractor-1");

    expect(result).toEqual(feedbacks);
  });
});
