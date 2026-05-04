import { api } from "@/services/api";

export type ContractorSummary = {
  currentMonthSpent?: number;
  totalSpent?: number;
  pendingAmount?: number;
  vacanciesCount?: number;
  totalVacancies?: number;
  averageRating?: number;
  rating?: number;
};

export const summaryService = {
  async getContractorSummary(): Promise<ContractorSummary> {
    try {
      const { data } = await api.get<ContractorSummary>(
        "/v1/users/contractors/me/financial-summary"
      );
      return data ?? {};
    } catch {
      return {};
    }
  },
};
