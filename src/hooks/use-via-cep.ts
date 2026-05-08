import { useCallback, useState } from "react";

import { isValidViaCepResponse, ViaCepResponse } from "@/types/via-cep";

export type EnderecoCompleto = {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type UseViaCepReturn = {
  loading: boolean;
  error: string | null;
  endereco: EnderecoCompleto | null;
  buscarCep: (cep: string) => Promise<EnderecoCompleto | null>;
  updateField: <K extends keyof EnderecoCompleto>(
    field: K,
    value: EnderecoCompleto[K]
  ) => void;
  reset: () => void;
};

export const initialEndereco: EnderecoCompleto = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

const VIACEP_API_URL = "https://viacep.com.br/ws";

/** Hook para buscar endereço via CEP usando a API do ViaCEP */
export function useViaCep(): UseViaCepReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endereco, setEndereco] = useState<EnderecoCompleto | null>(null);

  const buscarCep = useCallback(async (cep: string): Promise<EnderecoCompleto | null> => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setError("CEP inválido. Digite 8 dígitos.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${VIACEP_API_URL}/${cepLimpo}/json/`);

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data = await response.json();

      if (!isValidViaCepResponse(data)) {
        setError("CEP não encontrado");
        return null;
      }

      const enderecoCompleto: EnderecoCompleto = {
        cep: data.cep.replace(/\D/g, ""),
        // Se não tiver logradouro, usa o bairro como referência
        rua: data.logradouro || data.bairro || "",
        numero: "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
      };

      setEndereco(enderecoCompleto);
      setLoading(false);
      return enderecoCompleto;
    } catch {
      setError("Erro ao buscar CEP. Tente novamente.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof EnderecoCompleto>(
      field: K,
      value: EnderecoCompleto[K]
    ) => {
      setEndereco((prev) => {
        if (!prev) {
          return { ...initialEndereco, [field]: value };
        }
        return { ...prev, [field]: value };
      });
    },
    []
  );

  const reset = useCallback(() => {
    setEndereco(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    endereco,
    buscarCep,
    updateField,
    reset,
  };
}

/** Formata o CEP para o formato 00000-000 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
}

/** Formata o endereço completo para string de exibição */
export function formatEnderecoDisplay(endereco: EnderecoCompleto | null): string {
  if (!endereco) return "";

  const parts: string[] = [];

  if (endereco.rua && endereco.numero) {
    parts.push(`${endereco.rua}, ${endereco.numero}`);
  } else if (endereco.rua) {
    parts.push(endereco.rua);
  }

  if (endereco.complemento) {
    parts.push(endereco.complemento);
  }

  if (endereco.bairro) {
    parts.push(endereco.bairro);
  }

  if (endereco.cidade && endereco.uf) {
    parts.push(`${endereco.cidade}/${endereco.uf}`);
  } else if (endereco.cidade) {
    parts.push(endereco.cidade);
  }

  return parts.join(" - ");
}