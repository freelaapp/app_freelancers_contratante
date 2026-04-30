export type AvaliacaoPendente = {
  id: string;
  titulo: string;
  freelancer: string;
  data: string;
};

export type Avaliacao = {
  id: string;
  nome: string;
  data: string;
  estrelas: number;
  comentario: string;
};

export const AVALIACOES_PENDENTES: AvaliacaoPendente[] = [
  { id: "1", titulo: "Churrasqueiro - Aniversário 3...", freelancer: "João Silva", data: "22 Fev 2026" },
  { id: "2", titulo: "Garçom - Brunch Corporativo", freelancer: "Maria Souza", data: "10 Fev 2026" },
];

export const AVALIACOES_RECEBIDAS: Avaliacao[] = [
  {
    id: "1",
    nome: "João Silva",
    data: "10 Fev 2026",
    estrelas: 4,
    comentario: "Contratante excelente! Pagamento pontual e muito organizado.",
  },
  {
    id: "2",
    nome: "Ana Costa",
    data: "05 Fev 2026",
    estrelas: 3,
    comentario: "Boa experiência, local bem estruturado. Recomendo!",
  },
  {
    id: "3",
    nome: "Carlos Mendes",
    data: "28 Jan 2026",
    estrelas: 5,
    comentario: "Evento muito bem organizado, pagou certinho e tratou todos com respeito.",
  },
];

export const AVALIACOES_FEITAS: Avaliacao[] = [
  {
    id: "1",
    nome: "Pedro Oliveira",
    data: "05 Fev 2026",
    estrelas: 5,
    comentario: "Profissional incrível, super dedicado e pontual.",
  },
];
