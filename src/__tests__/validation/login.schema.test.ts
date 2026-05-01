import { ValidationError } from "yup";
import { loginSchema } from "@/validation/login.schema";

describe("loginSchema", () => {
  it("deve retornar erro quando email está vazio", async () => {
    await expect(
      loginSchema.validate({ email: "", password: "senha123" }, { abortEarly: false })
    ).rejects.toThrow(ValidationError);

    try {
      await loginSchema.validate({ email: "", password: "senha123" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("E-mail é obrigatório");
    }
  });

  it("deve retornar erro quando email é inválido", async () => {
    try {
      await loginSchema.validate({ email: "nao-e-email", password: "senha123" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Informe um e-mail válido");
    }
  });

  it("deve resolver sem erro quando email e senha são válidos", async () => {
    await expect(
      loginSchema.validate({ email: "usuario@email.com", password: "senha123" }, { abortEarly: false })
    ).resolves.toBeDefined();
  });

  it("deve retornar erro quando senha tem menos de 8 caracteres", async () => {
    try {
      await loginSchema.validate({ email: "usuario@email.com", password: "abc123" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("A senha deve ter no mínimo 8 caracteres");
    }
  });

  it("deve retornar erro quando senha está vazia", async () => {
    try {
      await loginSchema.validate({ email: "usuario@email.com", password: "" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Senha é obrigatória");
    }
  });
});
