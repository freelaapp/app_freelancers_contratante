import { api } from "@/services/api";
import type { VagaApi, VagaDetalheApi } from "@/types/vagas";

type ContractorModule = "home-services" | "bars-restaurants";

export type CreateVagaPayload = {
  title: string;
  description: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  address?: string;
};

export const vagasService = {
  async listByContractor(module: ContractorModule, contractorId: string): Promise<VagaApi[]> {
    try {
      const { data } = await api.get<VagaApi[]>(
        `/v1/${module}/vacancies/contractors/${contractorId}`
      );
      return Array.isArray(data) ? data : [];
    } catch {
      // fallback: endpoint alternativo documentado
      const { data } = await api.get<VagaApi[]>(
        `/v1/${module}/contractors/${contractorId}/vacancies`
      );
      return Array.isArray(data) ? data : [];
    }
  },

  async getById(module: ContractorModule, id: string): Promise<VagaDetalheApi> {
    const { data } = await api.get<VagaDetalheApi>(
      `/v1/${module}/vacancies/${id}`
    );
    return data;
  },

  async create(module: ContractorModule, payload: CreateVagaPayload): Promise<VagaApi> {
    const { data } = await api.post<VagaApi>(
      `/v1/${module}/vacancies`,
      payload
    );
    return data;
  },
};
