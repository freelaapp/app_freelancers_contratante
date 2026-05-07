/**
 * Tipo de resposta da API do ViaCEP
 * @see https://viacep.com.br/
 */
export type ViaCepResponse = {
  /** CEP retornado (pode vir com ou sem máscara) */
  cep: string;
  /** Nome do logradouro */
  logradouro: string;
  /** Complemento do logradouro */
  complemento: string;
  /** Nome do bairro */
  bairro: string;
  /** Nome da cidade */
  locality: string;
  /** Sigla do estado */
  uf: string;
  /** Código IBGE do estado */
  ibge: string;
  /** Código GIA */
  gia: string;
  /** Código DDD */
  ddd: string;
  /** Indica se o CEP é de的范围 */
  siafi: string;
};

/** Verifica se a resposta é válida */
export function isValidViaCepResponse(response: unknown): response is ViaCepResponse {
  if (!response || typeof response !== "object") return false;
  const obj = response as Partial<ViaCepResponse>;
  return typeof obj.cep === "string" && typeof obj.locality === "string";
}