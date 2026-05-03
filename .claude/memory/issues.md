# Issues — app-freela-freelancer

## 2026-04-15 — Conta nova caía na dashboard sem onboarding

- **Status:** ✅ Resolvido
- **Tipo:** Bug de fluxo de autenticação/onboarding
- **Causa raiz:** cadastro fora do contrato atual + restore de sessão inferindo estado local em vez do onboarding retornado pela API.
- **Correção:** payload de register alinhado ao contrato e restore via refresh usando `onboarding` da sessão API como fonte de verdade.
- **Arquivos:**
  - `src/presentation/contexts/AuthContext.tsx`
  - `src/data/repositories/AuthRepository.ts`
  - `src/domain/entities/Auth.ts`
  - `src/app/(auth)/register.tsx`
  - `src/domain/validators/registerPayload.ts` (removido)
- **Branch/commit:** `fix/register-persona-payload` / `9709040fce197b9cbf941056d8e8e6711ef2b915`
- **Validação:** fallback estático aprovado (contrato + cenários de navegação + refresh).

## 2026-04-15 — Finalização de cadastro retornando 400

- **Status:** ✅ Resolvido
- **Tipo:** Bug de integração mobile ↔ API
- **Causa raiz:** finalização do onboarding ainda usava rota contextual legada (`/bars-restaurants/providers`) e shape de payload fora do contrato canônico.
- **Correção:** integração migrada para `POST /v1/users/providers` com body JSON no wrapper `providerProfile`; removidos campos legados de módulo/persona e melhorado tratamento 400/422.
- **Arquivos:**
  - `src/data/services/provider-service.ts`
  - `src/presentation/screens/onboarding/useAreasForm.ts`
  - `docs/changelog.md`
- **Branch/commit:** `fix/register-persona-payload` / `93ce80cf1e49b471ea60b92d192ea9829de625ad`
- **Validação:** fallback técnico aprovado (endpoint, payload, erros 400/422, navegação pós-sucesso).
