import { contractorService } from "@/services/contractor.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: {
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("contractorService.create", () => {
  it("deve chamar POST /v1/bars-restaurants/contractors com payload", async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });

    const payload = { document: "12345678900", phone: "11999999999", city: "São Paulo" };
    await contractorService.create(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/bars-restaurants/contractors",
      payload
    );
  });
});

describe("contractorService.update", () => {
  it("deve chamar PUT /v1/bars-restaurants/contractors com payload", async () => {
    mockApi.put.mockResolvedValueOnce({ data: {} });

    const payload = { companyName: "Empresa Atualizada" };
    await contractorService.update(payload);

    expect(mockApi.put).toHaveBeenCalledWith(
      "/v1/bars-restaurants/contractors",
      payload
    );
  });
});

describe("contractorService.getById", () => {
  it("deve chamar GET com o id correto na URL", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: "abc123" } });

    const result = await contractorService.getById("abc123");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/bars-restaurants/contractors/abc123");
    expect(result.data).toEqual({ id: "abc123" });
  });
});
