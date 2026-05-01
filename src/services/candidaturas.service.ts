import { api } from "@/services/api";
import type { CandidatoApi } from "@/types/vagas";

export const candidaturasService = {
  async listByVacancy(vacancyId: string): Promise<CandidatoApi[]> {
    const { data } = await api.get<CandidatoApi[]>(
      `/v1/bars-restaurants/candidacies/vacancies/${vacancyId}`
    );
    return data;
  },

  async accept(candidacyId: string): Promise<void> {
    await api.patch("/v1/bars-restaurants/candidacies/accept", { candidacyId });
  },

  async reject(candidacyId: string): Promise<void> {
    await api.patch("/v1/bars-restaurants/candidacies/reject", { candidacyId });
  },
};
