export type VagaFilter = {
  id: string;
  label: string;
};

export const VAGA_FILTERS: VagaFilter[] = [
  { id: "todos", label: "Todos" },
  { id: "confirmados", label: "Confirmados" },
  { id: "aguardando", label: "Aguardando" },
  { id: "finalizados", label: "Finalizados" },
];
