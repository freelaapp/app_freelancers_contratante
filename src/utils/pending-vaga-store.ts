import type { VagaApi } from "@/types/vagas";

let _pending: VagaApi | null = null;

export const setPendingVaga = (vaga: VagaApi): void => {
  _pending = vaga;
};

export const consumePendingVaga = (): VagaApi | null => {
  const vaga = _pending;
  _pending = null;
  return vaga;
};
