import axios from "axios";

const viaCepClient = axios.create({
  baseURL: "https://viacep.com.br/ws",
  timeout: 8000,
});

const nominatimClient = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  timeout: 8000,
  headers: { "Accept-Language": "pt-BR" },
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

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export async function fetchCoordinatesByCep(cep: string): Promise<Coordinates | null> {
  const digits = cep.replace(/\D/g, "");
  try {
    const { data } = await nominatimClient.get<{ lat: string; lon: string }[]>(
      "/search",
      { params: { postalcode: digits, country: "BR", format: "json", limit: 1 } }
    );
    if (!data.length) return null;
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
  } catch {
    return null;
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
