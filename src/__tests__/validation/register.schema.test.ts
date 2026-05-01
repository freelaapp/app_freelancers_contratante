import { ValidationError } from "yup";
import { registerSchema } from "@/validation/register.schema";

const validData = {
  name: "João Silva",
  email: "joao@email.com",
  phone: "11987654321",
  password: "Senha123!",
  confirmPassword: "Senha123!",
  acceptedTerms: true,
};

describe("registerSchema", () => {
  it("deve retornar erro quando nome está vazio", async () => {
    try {
      await registerSchema.validate({ ...validData, name: "" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Nome é obrigatório");
    }
  });

  it("deve retornar erro quando email é inválido", async () => {
    try {
      await registerSchema.validate({ ...validData, email: "email-invalido" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Informe um e-mail válido");
    }
  });

  it("deve retornar erro quando telefone tem menos de 10 dígitos", async () => {
    try {
      await registerSchema.validate({ ...validData, phone: "119876" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Informe um número válido com DDD");
    }
  });

  it("deve retornar erro quando senha tem menos de 8 caracteres", async () => {
    try {
      await registerSchema.validate(
        { ...validData, password: "Ab1!", confirmPassword: "Ab1!" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("A senha deve ter no mínimo 8 caracteres");
    }
  });

  it("deve retornar erro quando senha não tem maiúscula", async () => {
    try {
      await registerSchema.validate(
        { ...validData, password: "senha123!", confirmPassword: "senha123!" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("A senha deve ter pelo menos uma letra maiúscula");
    }
  });

  it("deve retornar erro quando senha não tem número", async () => {
    try {
      await registerSchema.validate(
        { ...validData, password: "SenhaForte!", confirmPassword: "SenhaForte!" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("A senha deve ter pelo menos um número");
    }
  });

  it("deve retornar erro quando senha não tem caractere especial", async () => {
    try {
      await registerSchema.validate(
        { ...validData, password: "SenhaForte1", confirmPassword: "SenhaForte1" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("A senha deve ter pelo menos um caractere especial");
    }
  });

  it("deve retornar erro quando confirmPassword é diferente de password", async () => {
    try {
      await registerSchema.validate(
        { ...validData, confirmPassword: "senhadiferente" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("As senhas não coincidem");
    }
  });

  it("deve retornar erro quando acceptedTerms é false", async () => {
    try {
      await registerSchema.validate({ ...validData, acceptedTerms: false }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Você deve aceitar os termos para continuar");
    }
  });

  it("deve resolver sem erro quando todos os campos são válidos e acceptedTerms é true", async () => {
    await expect(
      registerSchema.validate(validData, { abortEarly: false })
    ).resolves.toBeDefined();
  });
});
