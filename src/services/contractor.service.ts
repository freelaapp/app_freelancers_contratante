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

  getCasaById: (id: string): Promise<AxiosResponse<CasaContractor>> =>
    api.get(`/v1/home-services/contractors/${id}`),

  getBarsById: (id: string): Promise<AxiosResponse<BarsContractor>> =>
    api.get(`/v1/bars-restaurants/contractors/${id}`),

  updateCasa: (payload: Partial<CasaContractorPayload>): Promise<AxiosResponse<CasaContractor>> =>
    api.put("/v1/freela-em-casa/contractors", payload),

  updateBars: (payload: {
    companyName?: string;
    document?: string;
    segment?: string;
    cityId?: string;
    complement?: string;
  }): Promise<AxiosResponse<BarsContractor>> =>
    api.put("/v1/bars-restaurants/contractors", payload),

  updateBarsImages: (images: {
    establishmentFacadeImage?: string;
    establishmentInteriorImage?: string;
  }): Promise<AxiosResponse<BarsContractor>> => {
    const form = new FormData();
    if (images.establishmentFacadeImage) {
      const uri = images.establishmentFacadeImage;
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      form.append("establishmentFacadeImage", { uri, name: `facade.${ext}`, type: mime } as any);
    }
    if (images.establishmentInteriorImage) {
      const uri = images.establishmentInteriorImage;
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      form.append("establishmentInteriorImage", { uri, name: `interior.${ext}`, type: mime } as any);
    }
    return api.put("/v1/bars-restaurants/contractors", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
