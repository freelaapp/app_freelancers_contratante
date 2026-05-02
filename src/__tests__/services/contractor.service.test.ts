import { contractorService } from "@/services/contractor.service";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: {
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
  },
}));

const mockedPost = api.post as jest.MockedFunction<typeof api.post>;
const mockedGet = api.get as jest.MockedFunction<typeof api.get>;

describe("contractorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCasa", () => {
    it("should call POST /v1/home-services/contractors with decomposed address fields", async () => {
      const payload = {
        document: "12345678901",
        cep: "01311000",
        street: "Avenida Paulista",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        uf: "SP",
        number: "123",
        complement: "Apto 12",
        address: "Avenida Paulista, 123, Apto 12, Bela Vista, São Paulo, SP",
        cityId: "city-uuid-1",
      };
      const mockResponse = {
        data: {
          id: "contractor-uuid",
          userId: "user-uuid",
          document: "12345678901",
          cep: "01311000",
          street: "Avenida Paulista",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          uf: "SP",
          number: "123",
          complement: "Apto 12",
          address: "Avenida Paulista, 123, Apto 12, Bela Vista, São Paulo, SP",
          cityId: "city-uuid-1",
          avatarUrl: null,
          isActive: true,
        },
      };
      mockedPost.mockResolvedValueOnce(mockResponse);

      const result = await contractorService.createCasa(payload);

      expect(mockedPost).toHaveBeenCalledTimes(1);
      expect(mockedPost).toHaveBeenCalledWith(
        "/v1/home-services/contractors",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should accept empty payload (all fields optional)", async () => {
      mockedPost.mockResolvedValueOnce({ data: {} });

      await contractorService.createCasa({});

      expect(mockedPost).toHaveBeenCalledWith("/v1/home-services/contractors", {});
    });

    it("should propagate errors from the api", async () => {
      mockedPost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(contractorService.createCasa({})).rejects.toThrow(
        "Network Error"
      );
    });
  });

  describe("createBars", () => {
    it("should call POST /v1/bars-restaurants/contractors with the given payload", async () => {
      const payload = {
        companyName: "Bar do João",
        document: "12345678000195",
        segment: "bar",
        cityId: "city-uuid-2",
      };
      const mockResponse = {
        data: {
          id: "contractor-uuid",
          userId: "user-uuid",
          companyName: "Bar do João",
          document: "12345678000195",
          segment: "bar",
          cityId: "city-uuid-2",
          avatarUrl: "",
        },
      };
      mockedPost.mockResolvedValueOnce(mockResponse);

      const result = await contractorService.createBars(payload);

      expect(mockedPost).toHaveBeenCalledTimes(1);
      expect(mockedPost).toHaveBeenCalledWith(
        "/v1/bars-restaurants/contractors",
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the api", async () => {
      mockedPost.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(contractorService.createBars({})).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("getCitiesCasa", () => {
    it("should call GET /v1/home-services/contractors/cities", async () => {
      const mockResponse = {
        data: [
          { id: "city-uuid-1", name: "São Paulo", state: "SP" },
          { id: "city-uuid-2", name: "Campinas", state: "SP" },
        ],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);

      const result = await contractorService.getCitiesCasa();

      expect(mockedGet).toHaveBeenCalledTimes(1);
      expect(mockedGet).toHaveBeenCalledWith(
        "/v1/home-services/contractors/cities"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return an empty data array when the api returns no cities", async () => {
      const mockResponse = { data: [] };
      mockedGet.mockResolvedValueOnce(mockResponse);

      const result = await contractorService.getCitiesCasa();

      expect(result.data).toEqual([]);
    });
  });

  describe("getCitiesBars", () => {
    it("should call GET /v1/bars-restaurants/contractors/cities", async () => {
      const mockResponse = {
        data: [{ id: "city-uuid-3", name: "Rio de Janeiro", state: "RJ" }],
      };
      mockedGet.mockResolvedValueOnce(mockResponse);

      const result = await contractorService.getCitiesBars();

      expect(mockedGet).toHaveBeenCalledTimes(1);
      expect(mockedGet).toHaveBeenCalledWith(
        "/v1/bars-restaurants/contractors/cities"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the api", async () => {
      mockedGet.mockRejectedValueOnce(new Error("Server Error"));

      await expect(contractorService.getCitiesBars()).rejects.toThrow(
        "Server Error"
      );
    });
  });
});
