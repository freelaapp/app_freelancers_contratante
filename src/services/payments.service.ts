import { api } from "@/services/api";
import { debug } from "@/utils/debug";

export type PaymentResponse = {
  id: string;
  status: string;
  value: number;
  correlationId: string;
  paymentLinkUrl: string | null;
  qrCodeImage: string | null;
  brCode: string | null;
  createdAt: string;
  updatedAt: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizePaymentResponse(raw: unknown): PaymentResponse {
  const input = asRecord(raw);
  const root = asRecord(input.props);
  const source = Object.keys(root).length > 0 ? root : input;
  const paymentMethods = asRecord(source.paymentMethods);
  const pix = asRecord(paymentMethods.pix);
  const charge = asRecord(source.charge);

  const normalized: PaymentResponse = {
    id: readString(source.id) ?? readString(charge.id) ?? "",
    status: readString(source.status) ?? readString(charge.status) ?? "PENDING",
    value: readNumber(source.value) || readNumber(charge.value) || readNumber(charge.amount),
    correlationId:
      readString(source.correlationId) ??
      readString(source.correlationID) ??
      readString(charge.correlationId) ??
      readString(charge.correlationID) ??
      "",
    paymentLinkUrl:
      readString(source.paymentLinkUrl) ??
      readString(source.link) ??
      readString(charge.paymentLinkUrl) ??
      null,
    qrCodeImage:
      readString(source.qrCodeImage) ??
      readString(source.qrcodeImage) ??
      readString(pix.qrCodeImage) ??
      readString(pix.qrcodeImage) ??
      readString(charge.qrCodeImage) ??
      null,
    brCode:
      readString(source.brCode) ??
      readString(source.brcode) ??
      readString(pix.brCode) ??
      readString(pix.brcode) ??
      readString(charge.brCode) ??
      null,
    createdAt: readString(source.createdAt) ?? readString(charge.createdAt) ?? "",
    updatedAt: readString(source.updatedAt) ?? readString(charge.updatedAt) ?? "",
  };

  debug.log("PaymentsService", "normalizacao de pagamento", {
    raw,
    normalized,
    hasQrCodeImage: Boolean(normalized.qrCodeImage),
    hasBrCode: Boolean(normalized.brCode),
  });

  return normalized;
}

export const paymentsService = {
  async createJobPayment(jobId: string, value: number): Promise<PaymentResponse> {
    debug.log("PaymentsService", "criando pagamento do job", { jobId, value });
    const { data } = await api.post(`/v1/jobs/${jobId}/payments`, {
      value,
      comment: "Pagamento do job",
    });
    debug.log("PaymentsService", "resposta bruta createJobPayment", { data });
    return normalizePaymentResponse(data);
  },

  async getJobPayment(jobId: string, suppressToast?: boolean): Promise<PaymentResponse> {
    debug.log("PaymentsService", "consultando pagamento do job", { jobId, suppressToast });
    const { data } = await api.get(`/v1/jobs/${jobId}/payments`, {
      ...(suppressToast ? { _suppressToast: true } : {}),
    });
    debug.log("PaymentsService", "resposta bruta getJobPayment", { data });
    return normalizePaymentResponse(data);
  },

  async createVacancyPayment(vacancyId: string, value: number): Promise<PaymentResponse> {
    debug.log("PaymentsService", "criando pagamento de vaga", { vacancyId, value });
    const { data } = await api.post("/v1/vacancies/jobs/payments", {
      vacancyId,
      value,
      comment: "Pagamento da vaga",
    });
    debug.log("PaymentsService", "resposta bruta createVacancyPayment", { data });
    return normalizePaymentResponse(data);
  },

  async getVacancyPayment(vacancyId: string, suppressToast?: boolean): Promise<PaymentResponse> {
    debug.log("PaymentsService", "consultando pagamento de vaga", { vacancyId, suppressToast });
    const { data } = await api.get(`/v1/vacancies/${vacancyId}/jobs/payments`, {
      ...(suppressToast ? { _suppressToast: true } : {}),
    });
    debug.log("PaymentsService", "resposta bruta getVacancyPayment", { data });
    return normalizePaymentResponse(data);
  },
};
