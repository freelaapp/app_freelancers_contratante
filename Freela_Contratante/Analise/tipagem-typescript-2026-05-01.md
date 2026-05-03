---
tags: [typescript, analise, tipagem]
date: 2026-05-01
status: revisão pendente
---

# Análise de Tipagem TypeScript — 2026-05-01

## Resumo Geral

A base de código apresenta uma tipagem TypeScript de nível intermediário-avançado com boa disciplina geral. Os schemas Yup usam `InferType` corretamente, a Context API está bem tipada, o tratamento de erros no `viacep.ts` é exemplar, e todos os componentes têm interfaces de props definidas. Os problemas encontrados são pontuais e concentrados principalmente em dois arquivos: o uso de `as never` em `completar-cadastro.tsx` (type assertion perigosa) e a ausência de tipo de retorno em funções async em múltiplas telas. Não há `any` implícito em nenhum arquivo do projeto.

---

## Problemas Críticos

Problemas que podem causar bugs em runtime ou esconder erros do compilador.

---

### 1. Type assertion `as never` no resolver do formulário

- **Arquivo:** `src/app/(auth)/completar-cadastro.tsx` linha 71
- **Problema:** O `yupResolver(completarCadastroSchema)` é passado com `as never` para silenciar um erro de compatibilidade de tipos entre o schema Yup e o tipo local `CompletarCadastroForm`. Isso desliga completamente a verificação de tipo neste ponto, podendo mascarar divergências entre o schema e o tipo do formulário. Se os dois ficarem fora de sincronia, o TypeScript não vai avisar.

```tsx
// Atual — perigoso
resolver: yupResolver(completarCadastroSchema) as never,
```

- **Solução sugerida:** Remover o tipo local `CompletarCadastroForm` (linhas 29–50) e usar diretamente o tipo inferido pelo schema:

```tsx
// src/app/(auth)/completar-cadastro.tsx

// Remover o tipo local CompletarCadastroForm e importar o inferido:
import { completarCadastroSchema, CompletarCadastroFormValues } from "@/validation/completar-cadastro.schema";

// No useForm, usar o tipo inferido:
const { control, handleSubmit, watch, setValue, setError, clearErrors } =
  useForm<CompletarCadastroFormValues>({
    resolver: yupResolver(completarCadastroSchema),
    // ...
  });

// Atualizar a assinatura da função de submit:
function handleSubmitForm(_data: CompletarCadastroFormValues) {
  completeProfile();
  router.replace("/(home)");
}
```

---

### 2. Duplicidade de tipo entre schema e type local em `completar-cadastro.tsx`

- **Arquivo:** `src/app/(auth)/completar-cadastro.tsx` linhas 26–50
- **Problema:** Existe um tipo local `CompletarCadastroForm` que replica manualmente os campos já definidos em `completarCadastroSchema`. Isso cria duas fontes de verdade: se o schema for alterado (novo campo, campo removido), o tipo local não é atualizado automaticamente e o compilador não detecta a divergência — especialmente quando o `as never` está presente.
- **Solução sugerida:** Excluir o tipo local e usar `CompletarCadastroFormValues` exportado de `completar-cadastro.schema.ts` (já exportado via `yup.InferType`). Ver solução do item 1 acima.

---

### 3. Ausência de dependências no array do `useEffect` em `_layout.tsx`

- **Arquivo:** `src/app/_layout.tsx` linha 28
- **Problema:** O array de dependências do `useEffect` não inclui `router`, que é usado dentro do efeito. O lint do React (`react-hooks/exhaustive-deps`) reportaria este aviso. Na prática, `router` é estável, mas a omissão é uma má prática que pode causar comportamentos inesperados se a instância do router mudar.

```tsx
// Atual
useEffect(() => {
  // usa router.replace(...)
}, [user, isInitializing, segments]); // router ausente
```

- **Solução sugerida:**

```tsx
useEffect(() => {
  // ...
}, [user, isInitializing, segments, router]);
```

---

## Problemas Moderados

Ausência de tipos explícitos que reduzem a segurança sem causar bugs imediatos.

---

### 4. Funções assíncronas sem tipo de retorno explícito

Várias funções `async` não declaram `Promise<void>` explicitamente. Embora o TypeScript infira corretamente, a ausência de anotação é uma omissão de contrato — especialmente relevante em handlers de formulário onde o tipo de retorno pode divergir silenciosamente se o corpo for alterado.

| Arquivo | Função | Linha |
|---|---|---|
| `src/app/(auth)/forgot-password.tsx` | `handleSubmit` | ~54 |
| `src/app/(auth)/confirm-email.tsx` | `handleConfirm` | ~48 |
| `src/app/(auth)/confirm-email.tsx` | `handleResend` | ~56 |
| `src/app/(home)/criar-vaga.tsx` | `handlePublish` | ~53 (síncrona usada como submit handler) |
| `src/components/photo-upload.tsx` | `handlePress` | ~13 |

- **Solução sugerida:** Anotar explicitamente:

```tsx
async function handleConfirm(): Promise<void> { ... }
async function handleResend(): Promise<void> { ... }
async function handlePress(): Promise<void> { ... }
```

---

### 5. `handlePublish` em `criar-vaga.tsx` recebe parâmetro não utilizado sem prefixo

- **Arquivo:** `src/app/(home)/criar-vaga.tsx` linha 53
- **Problema:** A função `handlePublish(data: CriarVagaFormValues)` recebe `data` mas não a usa. Convencionalmente, parâmetros intencionalmente ignorados devem ter prefixo `_` para sinalizar a intenção ao compilador e ao leitor.

```tsx
// Atual
function handlePublish(data: CriarVagaFormValues) {
  router.back();
}
```

- **Solução sugerida:**

```tsx
function handlePublish(_data: CriarVagaFormValues): void {
  router.back();
}
```

---

### 6. Tipo local `Avaliacao` em `freelancer-profile-sheet.tsx` duplica estrutura de `avaliacoes-mock.ts`

- **Arquivo:** `src/components/freelancer-profile-sheet.tsx` linhas 14–18
- **Problema:** O componente define um tipo `Avaliacao` local com campos `estrelas`, `data`, `comentario`. O arquivo `src/utils/avaliacoes-mock.ts` exporta um tipo `Avaliacao` com campos diferentes (`id`, `nome`, `data`, `estrelas`, `comentario`). São duas entidades distintas com o mesmo nome — isso cria confusão conceitual e impede reutilização do tipo do mock quando a integração com API ocorrer.
- **Solução sugerida:** Renomear o tipo local para `FreelancerAvaliacao` ou `ReviewItem` e exportá-lo de `src/types/` para facilitar reutilização:

```tsx
// src/types/review.ts
export type ReviewItem = {
  estrelas: number;
  data: string;
  comentario: string;
};
```

---

### 7. Objeto `AVALIACOES_MOCK` local em `vaga/[id].tsx` sem tipagem explícita

- **Arquivo:** `src/app/(home)/vaga/[id].tsx` linhas 195–198
- **Problema:** O array `AVALIACOES_MOCK` local não tem tipo anotado, dependendo de inferência. Se os campos forem alterados, o TypeScript só detecta o erro no ponto de uso (na prop `avaliacoes` do `FreelancerProfileSheet`), não na definição.

```tsx
// Atual — sem tipo
const AVALIACOES_MOCK = [
  { estrelas: 5, data: "03/04", comentario: "Trabalho incrível!" },
  { estrelas: 4, data: "01/04", comentario: "Muito eficaz e comprometido" },
];
```

- **Solução sugerida:** Anotar com o tipo `ReviewItem` (ver item 6):

```tsx
import type { ReviewItem } from "@/types/review";

const AVALIACOES_MOCK: ReviewItem[] = [
  { estrelas: 5, data: "03/04", comentario: "Trabalho incrível!" },
  { estrelas: 4, data: "01/04", comentario: "Muito eficaz e comprometido" },
];
```

---

### 8. `api.ts` sem interceptors e sem tipagem de resposta

- **Arquivo:** `src/services/api.ts`
- **Problema:** O arquivo cria a instância do `axios` mas não define interceptors de autenticação, refresh token, nem tipagem de resposta padrão. Quando a integração com a API real ocorrer, chamadas `api.get<T>(url)` sem o tipo genérico `T` retornarão `AxiosResponse<any>`, perdendo a segurança de tipo.
- **Solução sugerida:** Estrutura mínima recomendada para quando a API for integrada:

```ts
// src/services/api.ts
import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: "https://api.freela.com.br",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Exemplo de interceptor de autenticação (a ser implementado)
api.interceptors.request.use((config) => {
  // const token = getToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // tratamento centralizado de erros
    return Promise.reject(error);
  }
);
```

---

### 9. Estado `compareceu` em `vaga/[id].tsx` poderia usar union type mais restrito

- **Arquivo:** `src/app/(home)/vaga/[id].tsx` linha 234
- **Problema:** O estado `compareceu` é tipado como `boolean | null` e controlado com `useState<boolean | null>(null)`. O tipo está correto, mas o valor `null` representa "não respondido ainda" — uma semântica que poderia ser mais explícita com um tipo nomeado.
- **Nota:** Este é um ponto de melhoria menor; o código funciona corretamente.
- **Solução sugerida (opcional):**

```tsx
type CompareceuStatus = "sim" | "nao" | null;
const [compareceu, setCompareceu] = useState<CompareceuStatus>(null);
```

---

### 10. Tela `explore.tsx` sem tipagem de estilos e sem estrutura mínima

- **Arquivo:** `src/app/(home)/explore.tsx`
- **Problema:** A tela é um placeholder com valores literais de cor (`#fff`) e sem uso do design system (`colors`, `fontSizes`). Além disso, não tem nenhuma lógica de negócio ou tipo, o que é esperado para um placeholder, mas deve ser documentado.
- **Nota:** Não é um problema de tipagem, mas de consistência com o padrão do projeto.

---

## Boas Práticas Já Seguidas

O projeto demonstra vários padrões corretos que merecem reconhecimento:

**Context API — `src/context/auth-context.tsx`**
- Contexto tipado com `createContext<AuthContextType | null>(null)`
- Hook `useAuth()` com guard de null e mensagem de erro descritiva
- Todos os métodos com tipo de retorno explícito (`Promise<void>`, `void`)
- `useState` com genéricos corretos (`useState<User | null>(null)`)

**Services — `src/services/viacep.ts`**
- Tipo de retorno explícito em `fetchAddressByCep(cep: string): Promise<ViaCepResponse>`
- Classe de erro customizada `CepNotFoundError extends Error` para identificação precisa
- Uso de `instanceof` no catch de `completar-cadastro.tsx` para distinção de erros
- Tipo genérico no axios: `viaCepClient.get<ViaCepResponse & { erro?: boolean }>`

**Schemas Yup com `InferType`**
- `login.schema.ts`, `register.schema.ts` e `criar-vaga.schema.ts` exportam tipos via `yup.InferType` e esses tipos são usados corretamente nas telas
- Os `useForm<T>` recebem o tipo inferido como genérico (`useForm<LoginFormValues>`, `useForm<RegisterFormValues>`, `useForm<CriarVagaFormValues>`)
- `yupResolver` é aplicado sem type assertions nos três schemas acima

**Componentes com props tipadas**
- Todos os 21 componentes em `src/components/` têm `type Props` ou `type NomeProps` explícito
- Nenhum componente usa `React.FC` desnecessariamente — todos usam desestruturação direta com tipo anotado
- `forwardRef` no `Input` tipado corretamente como `forwardRef<TextInput, Props>`

**Design system centralizado**
- `src/constants/theme.ts` usa `as const` nos objetos, gerando tipos literais precisos
- `statusColors` tipado como `Record<StatusKey, { bg: string; text: string }>` via `keyof typeof statusColors` no `StatusBadge`

**Tipo de dados mock bem estruturado**
- `vagas-mock.ts` exporta `VagaStatus` como union type e `Candidato` com status como union `"pendente" | "aceito" | "recusado"`
- `VAGAS_DETALHE_MOCK` tipado como `Record<string, VagaDetalhe>`

**Navegação e parâmetros de rota**
- `useLocalSearchParams<{ id: string }>()` e `useLocalSearchParams<{ email: string }>()` com genérico correto

---

## Próximos Passos

Checklist priorizado:

- [ ] **[P0] Remover `as never`** em `completar-cadastro.tsx` e substituir o tipo local `CompletarCadastroForm` pelo `CompletarCadastroFormValues` inferido do schema
- [ ] **[P1] Adicionar `router` nas dependências do `useEffect`** em `_layout.tsx`
- [ ] **[P2] Criar `src/types/review.ts`** com o tipo `ReviewItem` e unificar com o tipo local de `freelancer-profile-sheet.tsx`
- [ ] **[P2] Anotar `AVALIACOES_MOCK`** em `vaga/[id].tsx` com o tipo `ReviewItem[]`
- [ ] **[P3] Anotar tipo de retorno** nas funções async em `forgot-password.tsx` e `confirm-email.tsx`
- [ ] **[P3] Prefixar `data` com `_`** em `handlePublish` de `criar-vaga.tsx` e anotar `void`
- [ ] **[P4] Preparar `api.ts`** com estrutura de interceptors (a ser implementado quando API real for integrada)
- [ ] **[P5] Considerar `CompareceuStatus`** como union type nomeado em `vaga/[id].tsx`
- [ ] **[P5] Migrar `explore.tsx`** para usar o design system quando a tela for implementada
