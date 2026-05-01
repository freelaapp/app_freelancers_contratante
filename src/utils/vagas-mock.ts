export type VagaStatus = "confirmado" | "aguardando" | "finalizado";

export type Candidato = {
  id: string;
  iniciais: string;
  nome: string;
  cargo: string;
  avaliacao: number;
  reviews: number;
  jobs: number;
  status: "pendente" | "aceito" | "recusado";
};

export type VagaDetalhe = {
  id: string;
  titulo: string;
  subtitulo: string;
  statusLabel: string;
  data: string;
  horario: string;
  local: string;
  distancia: string;
  duracao: string;
  valor: string;
  endereco: string;
  descricao: string;
  candidatos: Candidato[];
  stepAtual: number;
};

export type Vaga = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  value: string;
  status: VagaStatus;
};

export const VAGAS_MOCK: Vaga[] = [
  {
    id: "1",
    title: "Churrasqueiro - Aniversário",
    location: "Evento Privado",
    date: "22 Fev 2026",
    time: "14:00 - 22:00",
    value: "R$650",
    status: "confirmado",
  },
  {
    id: "2",
    title: "Bartender - Festa Premium",
    location: "Espaço Nobre",
    date: "22 Fev 2026",
    time: "20:00 - 03:00",
    value: "R$300",
    status: "confirmado",
  },
  {
    id: "3",
    title: "Garçom - Casamento",
    location: "Villa Real",
    date: "24 Fev 2026",
    time: "16:00 - 23:00",
    value: "R$280",
    status: "aguardando",
  },
  {
    id: "4",
    title: "Garçom - Evento Corporativo",
    location: "Buffet Elegance",
    date: "15 Fev 2026",
    time: "18:00 - 00:00",
    value: "R$250",
    status: "finalizado",
  },
];

// Detalhes mockados por ID — cada um num step diferente para testar o fluxo
export const VAGAS_DETALHE_MOCK: Record<string, VagaDetalhe> = {
  "1": {
    id: "1",
    titulo: "Churrasqueiro",
    subtitulo: "Evento Privado",
    statusLabel: "Confirmado",
    data: "22 Fev 2026",
    horario: "14:00 - 22:00",
    local: "São Paulo, SP",
    distancia: "5 km",
    duracao: "8h",
    valor: "R$650",
    endereco: "Rua das Flores, 123 - Vila Mariana, São Paulo",
    descricao: "Churrasqueiro experiente para aniversário de 30 anos com 80 convidados. Cortes nobres e acompanhamentos inclusos.",
    candidatos: [
      { id: "c1", iniciais: "CS", nome: "Carlos Silva", cargo: "Churrasqueiro", avaliacao: 4.9, reviews: 127, jobs: 253, status: "pendente" },
      { id: "c2", iniciais: "JA", nome: "Juliana Alves", cargo: "Bartender", avaliacao: 4.7, reviews: 89, jobs: 145, status: "aceito" },
      { id: "c3", iniciais: "PC", nome: "Pedro Costa", cargo: "Churrasqueiro", avaliacao: 4.5, reviews: 56, jobs: 98, status: "pendente" },
      { id: "c4", iniciais: "MS", nome: "Maria Santos", cargo: "Garçom", avaliacao: 4.8, reviews: 203, jobs: 312, status: "recusado" },
    ],
    stepAtual: 3, // Início do Trabalho
  },
  "2": {
    id: "2",
    titulo: "Bartender",
    subtitulo: "Festa Premium",
    statusLabel: "Confirmado",
    data: "22 Fev 2026",
    horario: "20:00 - 03:00",
    local: "Espaço Nobre",
    distancia: "3 km",
    duracao: "7h",
    valor: "R$300",
    endereco: "Av. Paulista, 900 - Bela Vista, São Paulo",
    descricao: "Bartender experiente para festa premium com open bar. Necessário conhecimento em drinks clássicos e autorais.",
    candidatos: [
      { id: "c1", iniciais: "RL", nome: "Rafael Lima", cargo: "Bartender", avaliacao: 4.8, reviews: 95, jobs: 180, status: "aceito" },
      { id: "c2", iniciais: "AM", nome: "Ana Martins", cargo: "Bartender", avaliacao: 4.6, reviews: 72, jobs: 134, status: "pendente" },
    ],
    stepAtual: 1, // Aceite da vaga
  },
  "3": {
    id: "3",
    titulo: "Garçom",
    subtitulo: "Casamento",
    statusLabel: "Aguardando",
    data: "24 Fev 2026",
    horario: "16:00 - 23:00",
    local: "Villa Real",
    distancia: "8 km",
    duracao: "7h",
    valor: "R$280",
    endereco: "Rua das Rosas, 500 - Jardins, São Paulo",
    descricao: "Garçom para casamento com 150 convidados. Experiência com serviço fino e etiqueta obrigatória. Uniforme fornecido.",
    candidatos: [
      { id: "c1", iniciais: "FO", nome: "Felipe Oliveira", cargo: "Garçom", avaliacao: 4.7, reviews: 110, jobs: 220, status: "pendente" },
      { id: "c2", iniciais: "BC", nome: "Beatriz Costa", cargo: "Garçom", avaliacao: 4.9, reviews: 88, jobs: 175, status: "pendente" },
      { id: "c3", iniciais: "LR", nome: "Lucas Rocha", cargo: "Garçom", avaliacao: 4.4, reviews: 43, jobs: 89, status: "pendente" },
    ],
    stepAtual: 0, // Criar Vaga
  },
  "4": {
    id: "4",
    titulo: "Garçom",
    subtitulo: "Evento Corporativo",
    statusLabel: "Finalizado",
    data: "15 Fev 2026",
    horario: "18:00 - 00:00",
    local: "Buffet Elegance",
    distancia: "2 km",
    duracao: "6h",
    valor: "R$250",
    endereco: "Rua Augusta, 200 - Consolação, São Paulo",
    descricao: "Garçom para evento corporativo de empresa de tecnologia. Serviço de coquetel com 60 convidados.",
    candidatos: [
      { id: "c1", iniciais: "TS", nome: "Thiago Santos", cargo: "Garçom", avaliacao: 4.6, reviews: 134, jobs: 267, status: "aceito" },
    ],
    stepAtual: 6, // Feedback
  },
};
