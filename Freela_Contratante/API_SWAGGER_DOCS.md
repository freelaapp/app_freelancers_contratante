---
title: API Swagger Docs
tags:
  - api
  - swagger
  - referencia
date: 2026-05-01
source: https://api.freelaservicosapp.com.br/docs
---

# API — Swagger Docs

**Base URL:** `https://api.freelaservicosapp.com.br`  
**Versão:** OpenAPI 3.0.0  
**Prefix:** `/v1`  
**Auth:** Bearer Token em todos os endpoints autenticados

> [!tip] Como usar no app
> O app contratante usa principalmente os grupos **BR — Contractors**, **BR — Vacancies**, **BR — Candidacies**, **BR — Jobs**, **BR — Check-in/out** e **BR — Feedbacks**.

---

## Payloads reais (confirmados via /docs-json)

### POST /v1/users/register — `RegisterUserDto`

```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "phoneNumber": "+5511999999999",
  "password": "StrongPass1!",
  "persona": "contractor",
  "module": "bars-restaurants",
  "contractorProfile": {
    "companyName": "Restaurante Bom Sabor",
    "document": "12345678000199",
    "segment": "eventos",
    "cityId": "city-uuid"
  }
}
```

> ⚠️ `phoneNumber` com prefixo `+55`. `persona` e `module` obrigatórios. `contractorProfile` opcional no registro.

### POST /v1/users/confirm-email — `ConfirmUserEmailDto`

```json
{
  "code": "123456",
  "email": "user@example.com"
}
```

> Apenas `code` é required. `email` é opcional.

### POST /v1/users/login — `LoginUserDto`

```json
{
  "email": "user@example.com",
  "password": "StrongPass1!"
}
```

### POST /v1/bars-restaurants/contractors/jobs/feedbacks — `CreateFeedbackDto`

```json
{
  "jobId": "job-uuid",
  "rating": 5,
  "comment": "Ótimo trabalho"
}
```

> ⚠️ Campo é `rating` (não `stars`). `comment` é opcional. NÃO tem campo `showed`.

### POST /v1/bars-restaurants/vacancies — `CreateVacancyDto`

```json
{
  "title": "Garçom para evento",
  "serviceType": "eventos",
  "date": "2026-03-20",
  "startTime": "2026-03-20T18:00:00.000Z",
  "endTime": "2026-03-20T23:00:00.000Z",
  "description": "Evento de casamento",
  "address": "Rua X, 123",
  "cityId": "city-uuid"
}
```

### PATCH /v1/bars-restaurants/candidacies/accept — `AcceptCandidacyDto`

```json
{ "candidacyId": "uuid" }
```

### PATCH /v1/bars-restaurants/candidacies/reject — `RejectCandidacyDto`

```json
{ "candidacyId": "uuid" }
```

### POST /v1/bars-restaurants/contractors/jobs/check-ins/code — `GenerateCheckInCodeDto`

```json
{ "jobId": "uuid" }
```

### POST /v1/bars-restaurants/contractors/jobs/check-outs/code — `GenerateCheckOutCodeDto`

```json
{ "jobId": "uuid" }
```

---

## Autenticação — Users

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/users/register` | Registrar novo usuário | ❌ |
| `POST` | `/v1/users/login` | Login do usuário | ❌ |
| `POST` | `/v1/users/auth/refresh` | Renovar access token | ❌ |
| `POST` | `/v1/users/confirm-email` | Confirmar email com código | ❌ |
| `POST` | `/v1/users/forgot-password` | Gerar código de reset de senha | ❌ |
| `GET` | `/v1/users/generate-email-confirmation-code` | Gerar código de confirmação | ✅ |
| `GET` | `/v1/users/generate-email-confirmation-code/{email}` | Gerar código por email | ❌ |
| `POST` | `/v1/users/google/connect` | Login/registro via Google OAuth | ❌ |
| `POST` | `/v1/users/reset-password` | Resetar senha com código | ❌ |

---

## Perfil do Usuário

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/v1/users/me` | Perfil do usuário autenticado | ✅ |
| `PUT` | `/v1/users` | Atualizar perfil autenticado | ✅ |
| `PUT` | `/v1/users/profile` | Atualizar nome/avatar | ✅ |
| `GET` | `/v1/users/{id}` | Perfil de usuário por ID | ✅ |
| `PATCH` | `/v1/users/{id}/disable` | Desabilitar conta (admin) | ✅ |
| `GET` | `/v1/users/me/notification-settings` | Configurações de notificação | ✅ |
| `PUT` | `/v1/users/me/notification-settings` | Atualizar notificações | ✅ |

---

## Contratante (Bars & Restaurants)

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/bars-restaurants/contractors` | Criar contratante | ✅ |
| `PUT` | `/v1/bars-restaurants/contractors` | Atualizar contratante | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/cities` | Listar cidades dos contratantes | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}` | Buscar contratante por ID | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/public-summary` | Resumo público | ❌ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/vacancies` | Vagas do contratante | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/future-jobs` | Jobs futuros | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/active-jobs` | Jobs ativos | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/credit-cards` | Cartões de crédito | ✅ |
| `POST` | `/v1/bars-restaurants/contractors/credit-cards` | Adicionar cartão | ✅ |
| `DELETE` | `/v1/bars-restaurants/contractors/credit-cards` | Remover cartão | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/financial-summary` | Resumo financeiro | ✅ |

---

## Vagas

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/v1/bars-restaurants/vacancies` | Listar vagas | ✅ |
| `POST` | `/v1/bars-restaurants/vacancies` | Criar vaga | ✅ |
| `GET` | `/v1/bars-restaurants/vacancies/{id}` | Buscar vaga por ID | ✅ |
| `PUT` | `/v1/bars-restaurants/vacancies/{id}` | Atualizar vaga | ✅ |
| `DELETE` | `/v1/bars-restaurants/vacancies/{id}` | Remover vaga | ✅ |
| `POST` | `/v1/bars-restaurants/vacancies/{id}/cancel` | Cancelar vaga | ✅ |
| `GET` | `/v1/bars-restaurants/vacancies/contractors/{id}` | Vagas por contratante | ✅ |

---

## Candidaturas

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/bars-restaurants/candidacies` | Criar candidatura | ✅ |
| `PATCH` | `/v1/bars-restaurants/candidacies/accept` | Aceitar candidatura | ✅ |
| `PATCH` | `/v1/bars-restaurants/candidacies/reject` | Rejeitar candidatura | ✅ |
| `GET` | `/v1/bars-restaurants/candidacies/vacancies/{vacancyId}` | Candidaturas por vaga | ✅ |
| `GET` | `/v1/bars-restaurants/candidacies/{id}` | Candidatura por ID | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/vacancies/{vacancyId}/candidacies` | Candidaturas da vaga (contratante) | ✅ |

---

## Jobs

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/bars-restaurants/jobs` | Criar/recuperar job por vaga | ✅ |
| `GET` | `/v1/bars-restaurants/jobs/{id}` | Buscar job por ID | ✅ |
| `PATCH` | `/v1/bars-restaurants/jobs/{id}/schedule` | Agendar job | ✅ |
| `PATCH` | `/v1/bars-restaurants/jobs/{id}/start` | Iniciar job | ✅ |
| `PATCH` | `/v1/bars-restaurants/jobs/{jobId}/terminate` | Finalizar job | ✅ |
| `DELETE` | `/v1/bars-restaurants/jobs/{id}` | Remover job | ✅ |
| `GET` | `/v1/bars-restaurants/jobs/by-vacancy/{vacancyId}` | Job por vaga | ✅ |
| `GET` | `/v1/bars-restaurants/jobs/{id}/check-in-status` | Status de check-in | ✅ |
| `GET` | `/v1/bars-restaurants/jobs/{jobId}/feedback-status` | Status de feedback | ✅ |

---

## Check-in / Check-out

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/bars-restaurants/contractors/jobs/check-ins/code` | **Gerar código de check-in** (contratante) | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/jobs/{jobId}/check-ins/status` | Status do check-in | ✅ |
| `POST` | `/v1/bars-restaurants/providers/jobs/check-ins/validate` | Validar código check-in (freelancer) | ✅ |
| `POST` | `/v1/bars-restaurants/providers/jobs/check-ins` | Registrar check-in | ✅ |
| `GET` | `/v1/bars-restaurants/providers/jobs/check-ins/{providerId}/jobs/{jobId}` | Listar check-ins | ✅ |
| `POST` | `/v1/bars-restaurants/contractors/jobs/check-outs/code` | **Gerar código de check-out** (contratante) | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/jobs/{jobId}/check-outs/status` | Status do check-out | ✅ |
| `POST` | `/v1/bars-restaurants/providers/jobs/check-outs/validate` | Validar código check-out | ✅ |
| `POST` | `/v1/bars-restaurants/contractors/jobs/check-outs` | Finalizar check-out (contratante) | ✅ |
| `POST` | `/v1/bars-restaurants/providers/jobs/{jobId}/check-out` | Confirmar check-out (freelancer) | ✅ |

---

## Feedbacks / Avaliações

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/bars-restaurants/contractors/jobs/feedbacks` | **Contratante avalia freelancer** | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/jobs/{jobId}/feedbacks` | Feedback por job | ✅ |
| `GET` | `/v1/bars-restaurants/contractors/{id}/jobs/feedbacks` | Todos os feedbacks do contratante | ✅ |
| `POST` | `/v1/bars-restaurants/providers/jobs/feedbacks` | Freelancer avalia contratante | ✅ |
| `GET` | `/v1/bars-restaurants/providers/{id}/jobs/{jobId}/feedbacks` | Feedback freelancer por job | ✅ |

---

## Pagamentos

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/jobs/{id}/payments` | Criar pagamento do job | ✅ |
| `GET` | `/v1/jobs/{id}/payments` | Buscar pagamento por job | ✅ |
| `POST` | `/v1/vacancies/jobs/payments` | Criar pagamento de vaga | ✅ |
| `GET` | `/v1/vacancies/{id}/jobs/payments` | Pagamento por vaga | ✅ |
| `GET` | `/v1/vacancies/{id}/repasse` | Status do repasse | ✅ |
| `POST` | `/v1/jobs/{id}/attendance-confirmation/open` | Abrir confirmação de presença | ✅ |
| `POST` | `/v1/jobs/{id}/attendance-confirmation/contractor-decision` | Decisão do contratante | ✅ |
| `GET` | `/v1/jobs/{id}/attendance-confirmation` | Status da confirmação | ✅ |

---

## Notificações

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/users/notification-subscriptions` | Inscrever em push notifications | ✅ |

---

## Uploads

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/v1/uploads/avatar` | Upload de avatar para S3/CDN | ✅ |

---

## Outros

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/v1/cities` | Listar cidades disponíveis | ❌ |
| `GET` | `/health` | Health check da API | ❌ |
| `GET` | `/v1/public/landing-snapshot` | Métricas da landing page | ❌ |

---

## Mapeamento — Fluxo da vaga no app

```
Step 0 → Criar Vaga
  POST /v1/bars-restaurants/vacancies

Step 1 → Aceitar candidatura
  GET  /v1/bars-restaurants/candidacies/vacancies/{vacancyId}
  PATCH /v1/bars-restaurants/candidacies/accept
  PATCH /v1/bars-restaurants/candidacies/reject

Step 2 → Confirmar pagamento
  POST /v1/jobs/{id}/payments

Step 3 → Check-in (gerar código)
  POST /v1/bars-restaurants/contractors/jobs/check-ins/code

Step 4 → Check-out (gerar código)
  POST /v1/bars-restaurants/contractors/jobs/check-outs/code

Step 5 → Confirmar repasse
  GET  /v1/vacancies/{id}/repasse

Step 6 → Avaliação
  POST /v1/bars-restaurants/contractors/jobs/feedbacks
```

---

## Códigos de resposta

| Código | Significado |
|---|---|
| `200/201` | Sucesso |
| `400` | Payload inválido |
| `401` | Token inválido ou ausente |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `409` | Conflito (duplicado, já existe) |
| `422` | Regra de negócio violada |
| `429` | Rate limit excedido |

---

## Referências

- [[Projeto/Visao-Geral|Visão Geral do Projeto]]
- [[Projeto/Proximos-Passos|Próximos Passos]]
- Swagger UI: https://api.freelaservicosapp.com.br/docs
