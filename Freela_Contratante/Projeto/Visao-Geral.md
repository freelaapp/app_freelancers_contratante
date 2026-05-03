---
title: Visão Geral — App Contratante
tags:
  - projeto
  - arquitetura
aliases:
  - App Contratante
  - Freela Contratante
updated: 2026-05-01
---

# App Contratante — Visão Geral

Aplicativo mobile para **contratantes** (empresas/pessoas que contratam freelancers) gerenciarem vagas, candidatos e pagamentos.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Roteamento | Expo Router (file-based, grupos `(auth)` e `(home)`) |
| Linguagem | TypeScript — `tsc` e `expo lint` zerados |
| Estilo | StyleSheet nativo + design tokens em `theme.ts` |
| Formulários | React Hook Form + Yup + `@hookform/resolvers` |
| Validação | Schemas em `src/validation/` por tela |
| HTTP | Axios com interceptors JWT + 401 handler + toast automático PT-BR |
| Auth | Context API (`auth-context.tsx`) + token-store em memória |
| Notificações | `react-native-toast-message` — sucesso/erro/info |
| Ícones | `@expo/vector-icons` (Ionicons) |
| Gradientes | `expo-linear-gradient` |
| Safe Area | `react-native-safe-area-context` |
| Testes | jest-expo + @testing-library/react-native (87 testes, 14 suites) |

## Estrutura de pastas

```
src/
  app/
    (auth)/
      login.tsx              ← RHF + Yup + authService.login() ✅
      register.tsx           ← RHF + Yup + authService.register() ✅
      completar-cadastro.tsx ← RHF + Yup + contractorService.create() ✅
      forgot-password.tsx    ← RHF + Yup (2 forms por step) + authService ✅
      confirm-email.tsx      ← authService.confirmEmail() ✅
    (home)/
      index.tsx              ← home com vagas reais da API ✅
      vagas.tsx              ← lista com filtros + vagasService ✅
      vaga/[id].tsx          ← detalhe + candidaturas + check-in/out + avaliação via API ✅
      criar-vaga.tsx         ← RHF + Yup ✅
      avaliacoes.tsx         ← feedbacksService ✅
      explore.tsx            ← placeholder (a implementar)
      profile.tsx
      notificacoes.tsx       ← estado vazio (sem endpoint de listagem na API)
    _layout.tsx              ← guard de autenticação + splash + Toast
  components/                ← 21+ componentes tipados com forwardRef
  constants/
    theme.ts                 ← design tokens (colors, spacing, radii, shadows)
  context/
    auth-context.tsx         ← sessão persistida + logout automático em 401
  services/
    api.ts                   ← axios + interceptors JWT + 401 + toast PT-BR
    token-store.ts           ← memória (Expo Go) / trocar por SecureStore no dev build
    auth.service.ts          ← register, login, me, confirmEmail, forgotPassword, resetPassword
    contractor.service.ts    ← create, update, getById
    vagas.service.ts         ← listByContractor, getById
    candidaturas.service.ts  ← listByVacancy, accept, reject
    jobs.service.ts          ← getByVacancy, generateCheckinCode, generateCheckoutCode
    feedbacks.service.ts     ← create, listByContractor
    viacep.ts                ← busca de CEP com CepNotFoundError
  types/
    api.ts                   ← AuthTokens, UserMe, LoginResponse, ContractorPayload, ApiError
    vagas.ts                 ← VagaApi, VagaDetalheApi, CandidatoApi, JobApi, FeedbackApi
  validation/
    login.schema.ts
    register.schema.ts
    completar-cadastro.schema.ts
    criar-vaga.schema.ts
    forgot-password.schema.ts
  utils/
    vaga-filters.ts          ← chips de filtro de vagas
    vaga-status-map.ts       ← mapApiStatus, mapApiStatusToStep, formatVagaValue
    toast.ts                 ← toast.success / toast.error / toast.info
  __tests__/
    components/              ← input.test.tsx
    context/                 ← auth-context.test.tsx
    services/                ← api, token-store, auth.service, contractor.service, viacep
    utils/                   ← vaga-filters.test.ts, toast.test.ts
    validation/              ← login, register, criar-vaga, completar-cadastro, forgot-password
```

## Fluxo de auth (regras de negócio)

```
1. Registro → POST /v1/users/register → confirmar email → tela confirm-email
2. Confirmar email → POST /v1/users/confirm-email → tela login
3. Login → POST /v1/users/login → salvar token → GET /v1/users/me
   → profileCompleted: true  → home
   → profileCompleted: false → completar-cadastro
4. Completar cadastro → POST /v1/bars-restaurants/contractors → home
5. Qualquer 401 → logout automático (handler registrado no auth-context)
6. Qualquer 4xx/5xx → toast automático com mensagem PT-BR do interceptor
```

## Fluxo completo da vaga (7 steps) — mapeamento API

```
Step 0 → Criar Vaga        → POST /v1/bars-restaurants/vacancies
Step 1 → Aceite candidato  → GET  /v1/bars-restaurants/candidacies/vacancies/{id}
                             PATCH /v1/bars-restaurants/candidacies/accept
                             PATCH /v1/bars-restaurants/candidacies/reject
Step 2 → Pagamento         → POST /v1/jobs/{id}/payments
Step 3 → Check-in          → POST /v1/bars-restaurants/contractors/jobs/check-ins/code
Step 4 → Check-out         → POST /v1/bars-restaurants/contractors/jobs/check-outs/code
Step 5 → Repasse           → GET  /v1/vacancies/{id}/repasse
Step 6 → Avaliação         → POST /v1/bars-restaurants/contractors/jobs/feedbacks
```

## Sanitização de dados antes de enviar à API

Todos os campos com máscara são limpos antes do envio:
- Telefone/celular: `(11) 99999-9999` → `11999999999`
- CPF: `123.456.789-00` → `12345678900`
- CNPJ: `12.345.678/0001-90` → `12345678000190`
- CEP: `01310-100` → `01310100`
- Data nascimento: `DD/MM/AAAA` → `AAAA-MM-DD` (ISO)

## Estado dos testes

```
Test Suites: 14 passed, 14 total
Tests:       87 passed, 87 total
tsc --noEmit: 0 erros
expo lint:    0 erros
```

## Links

- [[Projeto/Proximos-Passos|Próximos Passos]]
- [[API_SWAGGER_DOCS|Swagger Docs]]
- [[Analise/tipagem-typescript-2026-05-01|Análise de Tipagem]]
- [[Diario/2026-05-01|Diário 2026-05-01]]
