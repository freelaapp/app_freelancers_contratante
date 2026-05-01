import { ValidationError } from "yup";
import { completarCadastroSchema } from "@/validation/completar-cadastro.schema";

const commonAddress = {
  cep: "01001-000",
  estado: "SP",
  rua: "Praça da Sé",
  numero: "1",
  bairro: "Sé",
  cidade: "São Paulo",
};

const validCasaData = {
  tabPrincipal: "casa" as const,
  documento: "123.456.789-00",
  celular: "11987654321",
  dataNascimento: "01/01/1990",
  ...commonAddress,
};

const validEmpresasData = {
  tabPrincipal: "empresas" as const,
  cnpjEmpresa: "12.345.678/0001-90",
  razaoSocial: "Empresa Exemplo LTDA",
  ramoEstabelecimento: "Alimentação",
  nomeEstabelecimento: "Restaurante Exemplo",
  celularEmpresa: "11987654321",
  nomeResponsavel: "Maria Silva",
  telefoneResponsavel: "11987654321",
  ...commonAddress,
};

describe("completarCadastroSchema — tab casa", () => {
  it("deve retornar erro quando documento está ausente na tab casa", async () => {
    try {
      const data = { ...validCasaData, documento: undefined };
      await completarCadastroSchema.validate(data, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Documento é obrigatório");
    }
  });

  it("deve retornar erro quando celular está ausente na tab casa", async () => {
    try {
      const data = { ...validCasaData, celular: undefined };
      await completarCadastroSchema.validate(data, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Celular é obrigatório");
    }
  });

  it("deve retornar erro quando dataNascimento tem formato errado na tab casa", async () => {
    try {
      await completarCadastroSchema.validate(
        { ...validCasaData, dataNascimento: "1990-01-01" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Use o formato DD/MM/AAAA");
    }
  });

  it("deve resolver sem erro com dados válidos da tab casa", async () => {
    await expect(
      completarCadastroSchema.validate(validCasaData, { abortEarly: false })
    ).resolves.toBeDefined();
  });
});

describe("completarCadastroSchema — tab empresas", () => {
  it("deve retornar erro quando cnpjEmpresa está ausente na tab empresas", async () => {
    try {
      const data = { ...validEmpresasData, cnpjEmpresa: undefined };
      await completarCadastroSchema.validate(data, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("CNPJ é obrigatório");
    }
  });

  it("deve retornar erro quando razaoSocial está ausente na tab empresas", async () => {
    try {
      const data = { ...validEmpresasData, razaoSocial: undefined };
      await completarCadastroSchema.validate(data, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Razão social é obrigatória");
    }
  });

  it("deve resolver sem erro com dados válidos da tab empresas", async () => {
    await expect(
      completarCadastroSchema.validate(validEmpresasData, { abortEarly: false })
    ).resolves.toBeDefined();
  });
});

describe("completarCadastroSchema — CEP", () => {
  it("deve retornar erro quando CEP tem formato inválido", async () => {
    try {
      await completarCadastroSchema.validate(
        { ...validCasaData, cep: "0100100" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("CEP inválido");
    }
  });

  it("deve retornar erro quando CEP está vazio", async () => {
    try {
      await completarCadastroSchema.validate(
        { ...validCasaData, cep: "" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("CEP é obrigatório");
    }
  });
});
