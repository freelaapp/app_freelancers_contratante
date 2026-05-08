import type { VagaApi } from "@/types/vagas";

const ONE_HOUR_MS = 60 * 60 * 1000;

type OptimisticEntry = {
  vaga: VagaApi;
  addedAt: number;
};

let _entries: OptimisticEntry[] = [];

export function addOptimisticVaga(vaga: VagaApi): void {
  const now = Date.now();
  _entries = _entries
    .filter((e) => now - e.addedAt < ONE_HOUR_MS && e.vaga.id !== vaga.id);
  _entries = [{ vaga, addedAt: now }, ..._entries];
}

export function getOptimisticVagas(): VagaApi[] {
  const now = Date.now();
  _entries = _entries.filter((e) => now - e.addedAt < ONE_HOUR_MS);
  return _entries.map((e) => e.vaga);
}

export function clearOptimisticVagas(): void {
  _entries = [];
}
