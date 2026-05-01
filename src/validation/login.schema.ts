import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
