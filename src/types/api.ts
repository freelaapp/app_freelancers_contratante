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

export type CasaContractorPayload = {
  name?: string;
  document?: string;
  cityId?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  avatarUrl?: string;
};

export type BarsContractorPayload = {
  companyName?: string;
  document?: string;
  segment?: string;
  cityId?: string;
  avatarUrl?: string;
};

export type City = {
  id: string;
  name: string;
  state: string;
};

export type CasaContractor = {
  id: string;
  userId: string;
  name: string;
  document: string;
  address: string;
  cityId: string;
  avatarUrl: string;
};

export type BarsContractor = {
  id: string;
  userId: string;
  companyName: string;
  document: string;
  segment: string;
  cityId: string;
  avatarUrl: string;
};
