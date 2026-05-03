import { api } from "@/services/api";
import type { JobApi } from "@/types/vagas";

export const jobsService = {
  async getByVacancy(vacancyId: string): Promise<JobApi> {
    const { data } = await api.get<JobApi>(
      `/v1/bars-restaurants/jobs/by-vacancy/${vacancyId}`
    );
    return data;
  },

  async generateCheckinCode(jobId: string): Promise<string> {
    const { data } = await api.post<{ code: string } | string>(
      "/v1/bars-restaurants/contractors/jobs/check-ins/code",
      { jobId }
    );
    return typeof data === "string" ? data : data.code;
  },

  async generateCheckoutCode(jobId: string): Promise<string> {
    const { data } = await api.post<{ code: string } | string>(
      "/v1/bars-restaurants/contractors/jobs/check-outs/code",
      { jobId }
    );
    return typeof data === "string" ? data : data.code;
  },

  async getCheckinStatus(module: string, jobId: string): Promise<boolean> {
    try {
      const { data } = await api.get<Record<string, unknown>>(
        `/v1/${module}/contractors/jobs/${jobId}/check-ins/status`
      );
      return !!(
        data?.checkInExists ||
        data?.confirmed ||
        data?.status === "confirmed" ||
        data?.checkedIn
      );
    } catch {
      return false;
    }
  },

  async confirmCheckout(module: string, jobId: string): Promise<void> {
    await api.post(`/v1/${module}/contractors/jobs/check-outs`, { jobId });
  },
};
