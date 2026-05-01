import * as yup from "yup";

export const registerSchema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  email: yup
    .string()
    .required("E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  phone: yup
    .string()
    .required("Celular é obrigatório")
    .min(10, "Informe um número válido com DDD"),
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
  acceptedTerms: yup
    .boolean()
    .required()
    .oneOf([true], "Você deve aceitar os termos para continuar"),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;
