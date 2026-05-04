import type { VagaStatus } from "@/types/vagas";

const STATUS_MAP: Record<string, VagaStatus> = {
  confirmed: "confirmado",
  active: "confirmado",
  accepted: "confirmado",
  closed: "confirmado",
  in_progress: "confirmado",
  started: "confirmado",
  checking_in: "confirmado",
  checking_out: "confirmado",
  pending: "aguardando",
  waiting: "aguardando",
  open: "aguardando",
  finished: "finalizado",
  completed: "finalizado",
  done: "finalizado",
  cancelled: "finalizado",
};

export function mapApiStatus(apiStatus: string): VagaStatus {
  return STATUS_MAP[apiStatus?.toLowerCase()] ?? "aguardando";
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
