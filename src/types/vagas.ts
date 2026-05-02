export type VagaStatus = "confirmado" | "aguardando" | "finalizado";

export type VagaApi = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  address?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  value?: number;
  status: string;
  [key: string]: unknown;
};

export type VagaDetalheApi = VagaApi;

export type CandidatoApi = {
  id: string;
  freelancerId?: string;
  name?: string;
  role?: string;
  rating?: number;
  reviewCount?: number;
  jobCount?: number;
  status: "pending" | "accepted" | "rejected";
  avatarUrl?: string;
  [key: string]: unknown;
};

export type JobApi = {
  id: string;
  vacancyId: string;
  status: string;
  contractorId?: string;
  freelancerId?: string;
  [key: string]: unknown;
};

export type FeedbackApi = {
  id: string;
  jobId: string;
  stars: number;
  comment: string;
  showed: boolean;
  authorId?: string;
  authorType?: string;
  createdAt?: string;
  freelancerName?: string;
  contractorName?: string;
  [key: string]: unknown;
};
