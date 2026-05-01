import { api } from "@/services/api";
import type { FeedbackApi } from "@/types/vagas";

type CreateFeedbackPayload = {
  jobId: string;
  rating: number;
  comment?: string;
};

export const feedbacksService = {
  async create(payload: CreateFeedbackPayload): Promise<void> {
    await api.post("/v1/bars-restaurants/contractors/jobs/feedbacks", payload);
  },

  async listByContractor(contractorId: string): Promise<FeedbackApi[]> {
    const { data } = await api.get<FeedbackApi[]>(
      `/v1/bars-restaurants/contractors/${contractorId}/jobs/feedbacks`
    );
    return data;
  },
};
