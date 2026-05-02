import { api } from "@/services/api";
import type { VagaApi, VagaDetalheApi } from "@/types/vagas";

type ContractorModule = "home-services" | "bars-restaurants";

export const vagasService = {
  async listByContractor(module: ContractorModule, contractorId: string): Promise<VagaApi[]> {
    const { data } = await api.get<VagaApi[]>(
      `/v1/${module}/vacancies/contractors/${contractorId}`
    );
    return data;
  },

  async getById(module: ContractorModule, id: string): Promise<VagaDetalheApi> {
    const { data } = await api.get<VagaDetalheApi>(
      `/v1/${module}/vacancies/${id}`
    );
    return data;
  },
};
