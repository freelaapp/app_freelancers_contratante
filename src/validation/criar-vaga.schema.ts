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
    .matches(/^\d{2}:\d{2}$/, "Use o formato HH:MM")
    .test(
      "fim-apos-inicio",
      "Horário de encerramento deve ser depois do início",
      function (value) {
        const { horarioInicio } = this.parent;
        if (!horarioInicio || !value) return true;
        const [hi, mi] = horarioInicio.split(":").map(Number);
        const [hf, mf] = value.split(":").map(Number);
        return hf * 60 + mf > hi * 60 + mi;
      }
    ),
  endereco: yup.string().optional(),
  descricao: yup
    .string()
    .required("Descrição é obrigatória")
    .min(20, "A descrição deve ter no mínimo 20 caracteres"),
});

export type CriarVagaFormValues = yup.InferType<typeof criarVagaSchema>;
