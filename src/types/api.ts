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
