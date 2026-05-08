/**
 * Status de UI de uma vaga — derivados do campo vacancy.status da API
 * e, quando disponíveis, de campos auxiliares do payload (jobId, candidacies).
 *
 * A API retorna apenas dois estados em vacancy.status:
 *   - OPEN  → cobre todo o ciclo enquanto a vaga está ativa
 *   - CLOSED → vaga encerrada após check-out confirmado
 *   - CANCELLED_BY_CONTRACTOR → cancelada pelo contratante
 *
 * Os status "preenchida" e "em_andamento" são estados de UI derivados
 * de campos auxiliares presentes em alguns endpoints (ex: jobId presente,
 * candidacies com status ACCEPTED, job.status = SCHEDULED/IN_PROGRESS).
 * Quando esses campos não estiverem disponíveis, "aberta" é o fallback.
 */
export type VagaStatus = "aberta" | "preenchida" | "em_andamento" | "concluida";

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
  providerGlobalId?: string;
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
