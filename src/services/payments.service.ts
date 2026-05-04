import { api } from "@/services/api";

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

export const paymentsService = {
  async createVacancyPayment(vacancyId: string, value: number): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>("/v1/vacancies/jobs/payments", {
      vacancyId,
      value,
      comment: "Pagamento da vaga",
    });
    return data;
  },

  async getVacancyPayment(vacancyId: string): Promise<PaymentResponse> {
    const { data } = await api.get<PaymentResponse>(`/v1/vacancies/${vacancyId}/jobs/payments`);
    return data;
  },
};
