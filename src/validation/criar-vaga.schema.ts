import * as yup from "yup";

export const criarVagaSchema = yup.object({
  selectedServices: yup
    .array()
    .of(yup.string().required())
    .min(1, "Selecione ao menos um serviço")
    .required(),
  dataEvento: yup
    .string()
    .required("Data do evento é obrigatória")
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA"),
  horarioInicio: yup
    .string()
    .required("Horário de início é obrigatório")
    .matches(/^\d{2}:\d{2}$/, "Use o formato HH:MM"),
  horarioFim: yup
    .string()
    .required("Horário de encerramento é obrigatório")
    .matches(/^\d{2}:\d{2}$/, "Use o formato HH:MM"),
  endereco: yup.string().optional(),
  descricao: yup
    .string()
    .required("Descrição é obrigatória")
    .min(20, "A descrição deve ter no mínimo 20 caracteres"),
});

export type CriarVagaFormValues = yup.InferType<typeof criarVagaSchema>;
