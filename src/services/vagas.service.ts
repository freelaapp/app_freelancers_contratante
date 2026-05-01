import { api } from "@/services/api";
import type { VagaApi, VagaDetalheApi } from "@/types/vagas";

export const vagasService = {
  async listByContractor(contractorId: string): Promise<VagaApi[]> {
    const { data } = await api.get<VagaApi[]>(
      `/v1/bars-restaurants/vacancies/contractors/${contractorId}`
    );
    return data;
  },

  async getById(id: string): Promise<VagaDetalheApi> {
    const { data } = await api.get<VagaDetalheApi>(
      `/v1/bars-restaurants/vacancies/${id}`
    );
    return data;
  },
};
