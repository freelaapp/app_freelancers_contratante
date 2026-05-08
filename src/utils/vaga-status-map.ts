import type { VagaStatus } from "@/types/vagas";

/**
 * Status reais retornados pelo campo vacancy.status da API.
 *
 * A API expõe apenas três estados em vacancy.status:
 * - OPEN: vaga publicada — cobre todo o ciclo enquanto o job estiver em
 *   andamento (candidatos pendentes, candidato aceito, pagamento feito,
 *   check-in em progresso). O status só muda quando o check-out é concluído.
 * - CLOSED: vaga encerrada após validação do check-out pelo provider.
 * - CANCELLED_BY_CONTRACTOR: contratante cancelou a vaga.
 *
 * Os status de job (accepted, scheduled, in_progress, checking_in, etc.)
 * pertencem ao objeto job — entidade separada — e nunca aparecem em
 * vacancy.status. Referência: docs/api-contracts (3).md.
 *
 * Para estados de UI intermediários ("preenchida", "em_andamento"),
 * use mapApiStatusExtended() quando o payload incluir campos auxiliares.
 */
const VACANCY_STATUS_MAP: Record<string, VagaStatus> = {
  open: "aberta",
  closed: "concluida",
  cancelled: "concluida",
  cancelled_by_contractor: "concluida",
};

/**
 * Conjunto de job.status que indicam trabalho em andamento (check-in feito,
 * pagamento confirmado). Usado por mapApiStatusExtended para derivar "em_andamento".
 * Esses valores vêm do campo job.status — nunca de vacancy.status.
 */
const JOB_STATUS_IN_PROGRESS = new Set([
  "in_progress",
  "started",
  "checking_in",
  "checking_out",
  "transfer_pending",
]);

/**
 * Conjunto de job.status que indicam candidato aceito e pagamento confirmado,
 * mas trabalho ainda não iniciado. Usado para derivar "preenchida".
 */
const JOB_STATUS_SCHEDULED = new Set([
  "scheduled",
  "confirmed",
  "payment_completed",
  "active",
]);

/**
 * Mapeia vacancy.status da API para VagaStatus de UI.
 * Usa apenas o campo vacancy.status — sem dados auxiliares.
 * Para vagas OPEN, retorna sempre "aberta" independente do estado do job.
 */
export function mapApiStatus(apiStatus: string): VagaStatus {
  return VACANCY_STATUS_MAP[apiStatus?.toLowerCase()] ?? "aberta";
}

/**
 * Versão estendida que deriva o status de UI a partir de campos auxiliares
 * presentes em alguns endpoints (jobStatus, hasAcceptedCandidacy, etc.).
 *
 * Regras de derivação (aplicadas em ordem de precedência):
 * 1. vacancy.status = CLOSED ou CANCELLED* → "concluida"
 * 2. jobStatus pertence ao conjunto IN_PROGRESS → "em_andamento"
 * 3. jobStatus pertence ao conjunto SCHEDULED → "preenchida"
 * 4. hasAcceptedCandidacy = true (sem jobStatus) → "preenchida"
 * 5. vacancy.status = OPEN sem dados auxiliares → "aberta"
 *
 * @param vacancyStatus - Valor bruto de vacancy.status da API (ex: "OPEN", "CLOSED")
 * @param options - Campos auxiliares opcionais do payload
 * @param options.jobStatus - Valor de job.status quando disponível no payload
 * @param options.hasAcceptedCandidacy - true quando houver candidatura ACCEPTED
 */
export function mapApiStatusExtended(
  vacancyStatus: string,
  options: {
    jobStatus?: string;
    hasAcceptedCandidacy?: boolean;
  } = {}
): VagaStatus {
  const normalizedVacancy = vacancyStatus?.toLowerCase() ?? "";

  if (normalizedVacancy === "closed" || normalizedVacancy === "cancelled" || normalizedVacancy === "cancelled_by_contractor") {
    return "concluida";
  }

  const normalizedJob = options.jobStatus?.toLowerCase() ?? "";

  if (normalizedJob && JOB_STATUS_IN_PROGRESS.has(normalizedJob)) {
    return "em_andamento";
  }

  if (normalizedJob && JOB_STATUS_SCHEDULED.has(normalizedJob)) {
    return "preenchida";
  }

  if (options.hasAcceptedCandidacy === true) {
    return "preenchida";
  }

  return "aberta";
}

export function mapApiStatusToStep(apiStatus: string): number {
  const lower = apiStatus?.toLowerCase() ?? "";
  if (lower === "open") return 1;
  if (lower === "closed") return 6;
  if (lower === "cancelled_by_contractor" || lower === "cancelled") return 0;
  return 0;
}

export function formatVagaValue(value?: number): string {
  if (value == null) return "";
  const cents = Math.round(value * 100);
  const intPart = Math.floor(cents / 100).toString();
  const decPart = (cents % 100).toString().padStart(2, "0");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${intFormatted},${decPart}`;
}

export function formatVagaValueFromCents(cents?: number): string {
  if (cents == null) return "";
  const intPart = Math.floor(cents / 100).toString();
  const decPart = (cents % 100).toString().padStart(2, "0");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${intFormatted},${decPart}`;
}

export function resolveApiMoneyToReais(item: Record<string, unknown>): number | undefined {
  const cents =
    (item.chargeAmountInCents as number | undefined) ??
    (item.payment as number | undefined) ??
    (item.totalAmountInCents as number | undefined) ??
    (item.hourlyRateInCents as number | undefined);
  if (typeof cents === "number") return cents / 100;

  const rawValue = item.value as number | undefined;
  if (typeof rawValue !== "number") return undefined;

  // Em alguns payloads o backend envia `value` em centavos.
  if (Number.isInteger(rawValue) && rawValue >= 1000) return rawValue / 100;

  return rawValue;
}
