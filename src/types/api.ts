export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserMe = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  profileCompleted: boolean;
  contractorId?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  persona: "contractor" | "provider";
  module: "bars-restaurants" | "home-services" | "freela-em-casa";
  contractorProfile?: Record<string, unknown>;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserMe;
};

export type ConfirmEmailPayload = {
  email: string;
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
