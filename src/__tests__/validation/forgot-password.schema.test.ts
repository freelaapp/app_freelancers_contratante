import { ValidationError } from "yup";
import { forgotEmailSchema, forgotNewPasswordSchema } from "@/validation/forgot-password.schema";

describe("forgotEmailSchema", () => {
  it("deve retornar erro quando email está vazio", async () => {
    try {
      await forgotEmailSchema.validate({ email: "" }, { abortEarly: false });
      fail("deveria ter lançado erro");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).errors).toContain("E-mail é obrigatório");
    }
  });

  it("deve retornar erro quando email tem formato inválido", async () => {
    try {
      await forgotEmailSchema.validate({ email: "nao-e-email" }, { abortEarly: false });
      fail("deveria ter lançado erro");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).errors).toContain("Informe um e-mail válido");
    }
  });

  it("deve validar com sucesso quando email é válido", async () => {
    const result = await forgotEmailSchema.validate({ email: "teste@freela.com" });
    expect(result.email).toBe("teste@freela.com");
  });
});

describe("forgotNewPasswordSchema", () => {
  it("deve retornar erro quando senha está vazia", async () => {
    try {
      await forgotNewPasswordSchema.validate(
        { password: "", confirmPassword: "" },
        { abortEarly: false }
      );
      fail("deveria ter lançado erro");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).errors).toContain("Senha é obrigatória");
    }
  });

  it("deve retornar erro quando senha tem menos de 8 caracteres", async () => {
    try {
      await forgotNewPasswordSchema.validate(
        { password: "1234567", confirmPassword: "1234567" },
        { abortEarly: false }
      );
      fail("deveria ter lançado erro");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).errors).toContain("A senha deve ter no mínimo 8 caracteres");
    }
  });

  it("deve retornar erro quando confirmação não coincide com a senha", async () => {
    try {
      await forgotNewPasswordSchema.validate(
        { password: "senha123", confirmPassword: "outrasenha" },
        { abortEarly: false }
      );
      fail("deveria ter lançado erro");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).errors).toContain("As senhas não coincidem");
    }
  });

  it("deve retornar erro quando confirmação está vazia", async () => {
    try {
      await forgotNewPasswordSchema.validate(
        { password: "senha123", confirmPassword: "" },
        { abortEarly: false }
      );
      fail("deveria ter lançado erro");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      // Yup valida oneOf antes de required quando o campo existe mas está vazio
      const errors = (err as ValidationError).errors;
      expect(
        errors.includes("Confirmação de senha é obrigatória") ||
        errors.includes("As senhas não coincidem")
      ).toBe(true);
    }
  });

  it("deve validar com sucesso quando senha e confirmação coincidem", async () => {
    const result = await forgotNewPasswordSchema.validate({
      password: "Minhasenha1!",
      confirmPassword: "Minhasenha1!",
    });
    expect(result.password).toBe("Minhasenha1!");
    expect(result.confirmPassword).toBe("Minhasenha1!");
  });
});
