import { api } from "@/services/api";
import type { ContractorPayload } from "@/types/api";

export const contractorService = {
  create: (payload: ContractorPayload) =>
    api.post("/v1/bars-restaurants/contractors", payload),

  update: (payload: ContractorPayload) =>
    api.put("/v1/bars-restaurants/contractors", payload),

  getById: (id: string) =>
    api.get(`/v1/bars-restaurants/contractors/${id}`),
};
