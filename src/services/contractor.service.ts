import {
  BarsContractor,
  BarsContractorPayload,
  CasaContractor,
  CasaContractorPayload,
  City,
} from "@/types/api";
import { AxiosResponse } from "axios";
import { api } from "./api";

export const contractorService = {
  createCasa: (
    payload: CasaContractorPayload
  ): Promise<AxiosResponse<CasaContractor>> =>
    api.post("/v1/home-services/contractors", payload),

  createBars: (
    payload: BarsContractorPayload
  ): Promise<AxiosResponse<BarsContractor>> =>
    api.post("/v1/bars-restaurants/contractors", payload),

  getCitiesCasa: (): Promise<AxiosResponse<City[]>> =>
    api.get("/v1/home-services/contractors/cities"),

  getCitiesBars: (): Promise<AxiosResponse<City[]>> =>
    api.get("/v1/bars-restaurants/contractors/cities"),
};
