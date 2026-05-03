---
title: Próximos Passos
tags:
  - roadmap
  - planejamento
status: ativo
updated: 2026-05-01
---

# Próximos Passos

> **Regra geral:** toda feature, componente, screen, hook ou utilitário implementado **obrigatoriamente** deve vir com testes. Nenhuma implementação é concluída sem cobertura de testes.

## Ordem de execução

```
1  ✅ Setup de infraestrutura de testes (jest + testing-library)
2  ✅ Validações (RHF + Yup + schemas em src/validation/)
3  ✅ Testes unitários — schemas, viacep, vaga-filters, Input
4  ✅ Análise de tipagem TypeScript — 0 erros, 0 warnings
5  ✅ Interceptors API + persistência de sessão (token-store + auth-context)
6  ✅ Testes dos novos arquivos (forgot-password, token-store, api, auth-context)
7  ✅ Tipos de API (src/types/api.ts + src/types/vagas.ts)
8  ✅ Integração real com API — auth + contractor services
9  ✅ Remoção de todos os dados mockados — services de vagas, candidaturas, jobs, feedbacks
10 ✅ Sanitização de campos mascarados antes do envio à API
11 → Testes dos novos services (vagas, candidaturas, jobs, feedbacks)
12 → explore.tsx — implementar tela
13 → Dev Build (npx expo run:ios) → trocar token-store para expo-secure-store
14 → CI/CD com cobertura automatizada
```

---

## ✅ Concluído

### Setup de testes
- [x] `jest-expo`, `@testing-library/react-native`, `@testing-library/jest-native`, `@types/jest`
- [x] `jest.setup.ts` + config no `package.json`
- [x] Scripts: `test`, `test:watch`, `test:coverage`

### Validações RHF + Yup
- [x] `login.schema.ts`, `register.schema.ts`, `completar-cadastro.schema.ts`, `criar-vaga.schema.ts`, `forgot-password.schema.ts`
- [x] Telas migradas: login, register, completar-cadastro, criar-vaga, forgot-password
- [x] Border vermelho + mensagem de erro inline via prop `error` do `Input`

### Análise de tipagem
- [x] 57 arquivos analisados — zero `any` implícito
- [x] `tsc --noEmit` → 0 erros
- [x] `expo lint` → 0 erros, 0 warnings

### Infraestrutura de API
- [x] `token-store.ts` — store em memória (Expo Go) / trocar por `expo-secure-store` no dev build
- [x] `api.ts` — interceptor request (JWT) + interceptor response (401 → logout + toast PT-BR)
- [x] `auth-context.tsx` — restaura sessão no boot + handler de 401 automático
- [x] `react-native-toast-message` integrado no `_layout.tsx`

### Integração real com API
- [x] `src/types/api.ts` — AuthTokens, UserMe, LoginResponse, ContractorPayload, ApiError
- [x] `src/types/vagas.ts` — VagaApi, VagaDetalheApi, CandidatoApi, JobApi, FeedbackApi
- [x] `auth.service.ts` — register, login, me, confirmEmail, resendConfirmationCode, forgotPassword, resetPassword
- [x] `contractor.service.ts` — create, update, getById
- [x] `vagas.service.ts` — listByContractor, getById
- [x] `candidaturas.service.ts` — listByVacancy, accept, reject
- [x] `jobs.service.ts` — getByVacancy, generateCheckinCode, generateCheckoutCode
- [x] `feedbacks.service.ts` — create, listByContractor
- [x] `utils/toast.ts` — toast.success / toast.error / toast.info
- [x] `utils/vaga-status-map.ts` — mapApiStatus, mapApiStatusToStep, formatVagaValue

### Remoção de todos os mocks
- [x] `vagas-mock.ts` — deletado
- [x] `avaliacoes-mock.ts` — deletado
- [x] `index.tsx` — vagas reais da API com loading + estado vazio
- [x] `vagas.tsx` — listagem real com filtros + loading + estado vazio
- [x] `vaga/[id].tsx` — detalhe real + candidaturas + check-in/out + avaliação via API
- [x] `avaliacoes.tsx` — feedbacks reais separados por tipo
- [x] `notificacoes.tsx` — estado vazio (sem endpoint de listagem na API)

### Sanitização de dados antes do envio
- [x] `register.tsx` — `phone` enviado só com dígitos
- [x] `completar-cadastro.tsx` — CPF, CNPJ, celular, CEP, telefone sem formatação; data convertida para ISO (`AAAA-MM-DD`)

### Testes — 87 testes, 14 suites
- [x] `validation/login.schema.test.ts` (5)
- [x] `validation/register.schema.test.ts` (7)
- [x] `validation/criar-vaga.schema.test.ts` (5)
- [x] `validation/completar-cadastro.schema.test.ts` (8)
- [x] `validation/forgot-password.schema.test.ts`
- [x] `services/viacep.test.ts` (5)
- [x] `services/token-store.test.ts`
- [x] `services/api.test.ts`
- [x] `services/auth.service.test.ts` (7)
- [x] `services/contractor.service.test.ts` (3)
- [x] `utils/vaga-filters.test.ts` (7)
- [x] `utils/toast.test.ts` (3)
- [x] `components/input.test.tsx` (8)
- [x] `context/auth-context.test.tsx`

---

## 🔜 Próximo — Testes dos novos services

- [ ] `src/__tests__/services/vagas.service.test.ts`
- [ ] `src/__tests__/services/candidaturas.service.test.ts`
- [ ] `src/__tests__/services/jobs.service.test.ts`
- [ ] `src/__tests__/services/feedbacks.service.test.ts`

## 🔜 Tela Explore

- [ ] `explore.tsx` é placeholder — definir com produto o que vai nessa tela

## 🔜 Dev Build

- [ ] `npx expo run:ios` ou `npx expo run:android`
- [ ] Trocar `token-store.ts` para usar `expo-secure-store` (keychain criptografado)
- [ ] Testar fluxo completo no dispositivo com API real

## 🔜 Ajustes pós-integração (confirmar com backend)

- [ ] `mapApiStatusToStep` — confirmar strings de status do job com backend
- [ ] `feedbacksService` — confirmar campo `authorType` na resposta da API
- [ ] `jobsService.generateCheckinCode` — confirmar campo `code` no response
- [ ] Verificar se `UserMe` tem `contractorId` ou outro campo equivalente

## 🔜 CI/CD

- [ ] GitHub Actions rodando `jest --coverage` em cada PR
- [ ] Threshold mínimo: 70% global

---

## Referências

- [[Projeto/Visao-Geral|Visão Geral do Projeto]]
- [[API_SWAGGER_DOCS|Swagger — Todos os endpoints]]
- [[Analise/tipagem-typescript-2026-05-01|Análise de Tipagem 2026-05-01]]
- [[Diario/2026-05-01|Diário 2026-05-01]]
