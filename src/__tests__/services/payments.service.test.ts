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

  it("deve normalizar resposta com qrCode/brCode em paymentMethods.pix", async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        id: "pay-2",
        status: "PENDING",
        value: 10000,
        correlationID: "corr-2",
        paymentMethods: {
          pix: {
            qrCodeImage: "data:image/png;base64,abc",
            brCode: "000201...",
          },
        },
        createdAt: "2026-05-04T10:00:00.000Z",
        updatedAt: "2026-05-04T10:00:00.000Z",
      },
    });

    const result = await paymentsService.createVacancyPayment("vaga-2", 10000);

    expect(result.qrCodeImage).toBe("data:image/png;base64,abc");
    expect(result.brCode).toBe("000201...");
    expect(result.correlationId).toBe("corr-2");
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

    expect(mockApi.get).toHaveBeenCalledWith("/v1/vacancies/vaga-1/jobs/payments", expect.any(Object));
  });

  it("deve retornar o PaymentResponse do body da resposta", async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockPayment });

    const result = await paymentsService.getVacancyPayment("vaga-1");

    expect(result).toEqual(mockPayment);
  });

  it("deve normalizar resposta quando dados vierem em charge", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        charge: {
          id: "pay-3",
          status: "COMPLETED",
          value: 150,
          correlationId: "corr-3",
          qrCodeImage: "base64imagedata",
          brCode: "00020101021226870014br.gov.bcb.pix",
          createdAt: "2026-05-04T10:00:00.000Z",
          updatedAt: "2026-05-04T10:00:00.000Z",
        },
      },
    });

    const result = await paymentsService.getVacancyPayment("vaga-3");

    expect(result).toEqual({
      id: "pay-3",
      status: "COMPLETED",
      value: 150,
      correlationId: "corr-3",
      paymentLinkUrl: null,
      qrCodeImage: "base64imagedata",
      brCode: "00020101021226870014br.gov.bcb.pix",
      createdAt: "2026-05-04T10:00:00.000Z",
      updatedAt: "2026-05-04T10:00:00.000Z",
    });
  });

  it("deve normalizar resposta quando backend retornar campos em data.props", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        props: {
          id: "pay-4",
          status: "ACTIVE",
          value: 17685,
          correlationId: "vaga-4",
          paymentLinkUrl: "https://woovi.com/pay/abc",
          qrCodeImage: "https://api.woovi.com/openpix/charge/brcode/image/abc.png",
          brCode: "00020101021226",
          createdAt: "2026-05-07T05:26:49.537Z",
          updatedAt: "2026-05-07T05:26:49.537Z",
        },
      },
    });

    const result = await paymentsService.getVacancyPayment("vaga-4");

    expect(result).toEqual({
      id: "pay-4",
      status: "ACTIVE",
      value: 17685,
      correlationId: "vaga-4",
      paymentLinkUrl: "https://woovi.com/pay/abc",
      qrCodeImage: "https://api.woovi.com/openpix/charge/brcode/image/abc.png",
      brCode: "00020101021226",
      createdAt: "2026-05-07T05:26:49.537Z",
      updatedAt: "2026-05-07T05:26:49.537Z",
    });
  });

  it("deve propagar erro quando a chamada falha", async () => {
    const error = new Error("Not found");
    mockApi.get.mockRejectedValueOnce(error);

    await expect(paymentsService.getVacancyPayment("vaga-1")).rejects.toThrow("Not found");
  });
});

describe("paymentsService.createJobPayment", () => {
  it("deve chamar POST /v1/jobs/:id/payments com body correto", async () => {
    mockApi.post.mockResolvedValueOnce({ data: mockPayment });

    await paymentsService.createJobPayment("job-1", 150);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/jobs/job-1/payments", {
      value: 150,
      comment: "Pagamento do job",
    });
  });
});

describe("paymentsService.getJobPayment", () => {
  it("deve chamar GET /v1/jobs/:id/payments com jobId correto", async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockPayment });

    await paymentsService.getJobPayment("job-1");

    expect(mockApi.get).toHaveBeenCalledWith("/v1/jobs/job-1/payments", expect.any(Object));
  });
});
