import type { VagaStatus } from "@/types/vagas";

const STATUS_MAP: Record<string, VagaStatus> = {
  // Abertas (ainda sem freelancer efetivamente selecionado)
  pending: "aberta",
  waiting: "aberta",
  open: "aberta",
  // Preenchidas (freelancer selecionado e aguardando execução)
  accepted: "preenchida",
  confirmed: "preenchida",
  scheduled: "preenchida",
  payment_pending: "preenchida",
  // Em andamento
  active: "em_andamento",
  in_progress: "em_andamento",
  started: "em_andamento",
  checking_in: "em_andamento",
  checking_out: "em_andamento",
  transfer_pending: "em_andamento",
  // Concluídas (inclui concluídas e canceladas)
  closed: "concluida",
  finished: "concluida",
  completed: "concluida",
  done: "concluida",
  cancelled: "concluida",
  cancelled_by_contractor: "concluida",
};

export function mapApiStatus(apiStatus: string): VagaStatus {
  return STATUS_MAP[apiStatus?.toLowerCase()] ?? "aberta";
}

export function mapApiStatusToStep(apiStatus: string): number {
  const lower = apiStatus?.toLowerCase() ?? "";
  if (lower === "open") return 1;
  if (lower === "pending" || lower === "waiting") return 1;
  if (lower === "accepted") return 1;
  if (lower === "closed") return 2;
  if (lower === "payment_pending") return 2;
  if (lower === "active" || lower === "confirmed") return 3;
  if (lower === "in_progress" || lower === "started" || lower === "checking_in") return 3;
  if (lower === "checking_out") return 4;
  if (lower === "transfer_pending") return 5;
  if (lower === "finished" || lower === "completed" || lower === "done") return 6;
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
