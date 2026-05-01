import axios from "axios";

const viaCepClient = axios.create({
  baseURL: "https://viacep.com.br/ws",
  timeout: 8000,
});

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};

export class CepNotFoundError extends Error {
  constructor() {
    super("CEP não encontrado");
  }
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse> {
  const digits = cep.replace(/\D/g, "");

  if (digits.length !== 8) {
    throw new Error("CEP inválido");
  }

  const { data } = await viaCepClient.get<ViaCepResponse & { erro?: boolean }>(
    `/${digits}/json/`
  );

  if (data.erro) {
    throw new CepNotFoundError();
  }

  return data;
}
