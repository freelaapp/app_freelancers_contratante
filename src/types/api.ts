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
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
  latitude?: number;
  longitude?: number;
  cnpj?: string;
  corporateReason?: string;
  cpf?: string;
  companyName?: string;
  document?: string;
  segment?: string;
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
  avatarUrl: string | null;
  establishmentFacadeImage: string | null;
  establishmentInteriorImage: string | null;
  photos: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// Resposta do GET /v1/users/me (perfil do usuário, sem campos de auth)
export type UserProfile = {
  id: string;       // profile UUID
  userId: string;   // user UUID
  name: string;
  phone?: string;
  avatarUrl?: string;
  cityId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Mantido por compatibilidade com mocks de teste
export type UserMe = UserProfile;

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
};

// Resposta do POST /v1/users/register — retorna TokenPair diretamente
export type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    emailConfirmed: boolean;
    userType: string;
  };
  onboarding: {
    isPending: boolean;
    nextStep: string | null;
  };
  context: {
    modules: string[];
    profilesByModule: Record<string, { contractorId: string; role: string }>;
  };
};

export type ConfirmEmailPayload = {
  userId?: string;
  email?: string;
  code: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
};

export type ContractorPayload = {
  document?: string;
  phone?: string;
  birthDate?: string;
  zipCode?: string;
  state?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  cnpj?: string;
  companyName?: string;
  businessType?: string;
  establishmentName?: string;
  companyPhone?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  photo1?: string;
  photo2?: string;
};

export type ApiError = {
  message: string;
  statusCode: number;
};
