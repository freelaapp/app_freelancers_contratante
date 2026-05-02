import * as yup from "yup";

export const forgotEmailSchema = yup.object({
  email: yup
    .string()
    .required("E-mail é obrigatório")
    .email("Informe um e-mail válido"),
});

export const forgotNewPasswordSchema = yup.object({
  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .matches(/[A-Z]/, "A senha deve ter pelo menos uma letra maiúscula")
    .matches(/[0-9]/, "A senha deve ter pelo menos um número")
    .matches(/[^A-Za-z0-9]/, "A senha deve ter pelo menos um caractere especial"),
  confirmPassword: yup
    .string()
    .required("Confirmação de senha é obrigatória")
    .oneOf([yup.ref("password")], "As senhas não coincidem"),
});

export type ForgotEmailValues = yup.InferType<typeof forgotEmailSchema>;
export type ForgotNewPasswordValues = yup.InferType<typeof forgotNewPasswordSchema>;
