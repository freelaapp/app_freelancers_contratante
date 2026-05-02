import * as yup from "yup";

export const completarCadastroSchema = yup.object({
  tabPrincipal: yup.string().oneOf(["casa", "empresas"] as const).required(),

  documento: yup.string().when("tabPrincipal", {
    is: "casa",
    then: (s) => s.required("Documento é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  celular: yup.string().when("tabPrincipal", {
    is: "casa",
    then: (s) => s.required("Celular é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  dataNascimento: yup.string().when("tabPrincipal", {
    is: "casa",
    then: (s) =>
      s
        .required("Data de nascimento é obrigatória")
        .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA"),
    otherwise: (s) => s.optional(),
  }),

  cnpjEmpresa: yup.string().when("tabPrincipal", {
    is: "empresas",
    then: (s) => s.required("CNPJ é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  razaoSocial: yup.string().when("tabPrincipal", {
    is: "empresas",
    then: (s) => s.required("Razão social é obrigatória"),
    otherwise: (s) => s.optional(),
  }),
  ramoEstabelecimento: yup.string().when("tabPrincipal", {
    is: "empresas",
    then: (s) => s.required("Ramo do estabelecimento é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  nomeEstabelecimento: yup.string().when("tabPrincipal", {
    is: "empresas",
    then: (s) => s.required("Nome do estabelecimento é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  celularEmpresa: yup.string().when("tabPrincipal", {
    is: "empresas",
    then: (s) => s.required("Celular é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  nomeResponsavel: yup.string().when("tabPrincipal", {
    is: "empresas",
    then: (s) => s.required("Nome do responsável é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  telefoneResponsavel: yup.string().when("tabPrincipal", {
    is: "empresas",
    then: (s) => s.required("Telefone do responsável é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  foto1: yup.string().optional(),
  foto2: yup.string().optional(),

  cep: yup
    .string()
    .required("CEP é obrigatório")
    .matches(/^\d{5}-?\d{3}$/, "CEP inválido"),
  estado: yup.string().required("Estado é obrigatório"),
  rua: yup.string().required("Rua é obrigatória"),
  numero: yup.string().required("Número é obrigatório"),
  bairro: yup.string().required("Bairro é obrigatório"),
  cidade: yup.string().required("Cidade é obrigatória"),
  complemento: yup.string().optional(),
});

// yup.InferType exclui campos referenciados em .when() do output type — definição manual necessária
export type CompletarCadastroFormValues = {
  tabPrincipal: "casa" | "empresas";
  documento?: string;
  celular?: string;
  dataNascimento?: string;
  cep: string;
  estado: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  complemento?: string;
  cnpjEmpresa?: string;
  razaoSocial?: string;
  ramoEstabelecimento?: string;
  nomeEstabelecimento?: string;
  celularEmpresa?: string;
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
  foto1?: string;
  foto2?: string;
};
