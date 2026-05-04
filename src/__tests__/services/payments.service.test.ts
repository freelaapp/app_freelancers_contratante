import { paymentsService } from "@/services/payments.service";
import { api } from "@/services/api";
import type { PaymentResponse } from "@/services/payments.service";

jest.mock("@/services/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const mockPayment: PaymentResponse = {
  id: "pay-1",
  status: "PENDING",
  value: 150,
  correlationId: "corr-1",
  paymentLinkUrl: null,
  qrCodeImage: "base64imagedata",
  brCode: "00020101021226870014br.gov.bcb.pix",
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

beforeEach(() => jest.clearAllMocks());

describe("paymentsService.createVacancyPayment", () => {
  it("deve chamar POST /v1/vacancies/jobs/payments com body correto", async () => {
    mockApi.post.mockResolvedValueOnce({ data: mockPayment });

    await paymentsService.createVacancyPayment("vaga-1", 150);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/vacancies/jobs/payments", {
      vacancyId: "vaga-1",
      value: 150,
      comment: "Pagamento da vaga",
    });
  });

  it("deve retornar o PaymentResponse do body da resposta", async () => {
    mockApi.post.mockResolvedValueOnce({ data: mockPayment });

    const result = await paymentsService.createVacancyPayment("vaga-1", 150);

    expect(result).toEqual(mockPayment);
  });

  it("deve propagar erro quando a chamada falha", async () => {
    const error = new Error("Network error");
    mockApi.post.mockRejectedValueOnce(error);

    await expect(paymentsService.createVacancyPayment("vaga-1", 150)).rejects.toThrow("Network error");
  });
});

describe("paymentsService.getVacancyPayment", () => {
  it("deve chamar GET /v1/vacancies/:id/jobs/payments com vacancyId correto", async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockPayment });

    await paymentsService.getVacancyPayment("vaga-1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/vacancies/vaga-1/jobs/payments");
  });

  it("deve retornar o PaymentResponse do body da resposta", async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockPayment });

    const result = await paymentsService.getVacancyPayment("vaga-1");

    expect(result).toEqual(mockPayment);
  });

  it("deve propagar erro quando a chamada falha", async () => {
    const error = new Error("Not found");
    mockApi.get.mockRejectedValueOnce(error);

    await expect(paymentsService.getVacancyPayment("vaga-1")).rejects.toThrow("Not found");
  });
});
