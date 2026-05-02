# API Contracts

## Estratégia de Comunicação

- **Tipo:** REST
- **Versionamento:** prefixo `/v1/` em todos os endpoints
- **Padrão de path:** `/v1/{produto}/{recurso}` para módulos · `/v1/{recurso}` para Shared Kernel
- **Contratos:** OpenAPI 3.0 gerado automaticamente via `@nestjs/swagger`
- **Documentação viva:** disponível em `/docs` (Swagger UI) nos ambientes dev e staging

## Base URL

- **Produção:** \_\_\_ _(preenchido pelo Dev Backend no deploy)_
- **Staging:** \_\_\_ _(preenchido pelo Dev Backend no deploy)_
- **Local:** `http://localhost:3000`

## Autenticação

- **Tipo:** Bearer JWT
- **Header:** `Authorization: Bearer {accessToken}`
- **Refresh:** `POST /v1/users/auth/refresh` · `POST /v1/admins/auth/refresh`
- **Access token:** curta duração (recomendado: 15min)
- **Refresh token:** longa duração (recomendado: 7 dias)

## Padrão de Resposta

**Sucesso:**

```json
{
  "data": {}
}
```

**Sucesso com paginação:**

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "perPage": 20,
    "lastPage": 1
  }
}
```

**Erro:**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Descrição legível do erro"
  }
}
```

## HTTP Status Codes

| Status | Uso                                                 |
| ------ | --------------------------------------------------- |
| `200`  | Sucesso geral (GET, PUT, PATCH)                     |
| `201`  | Recurso criado (POST)                               |
| `204`  | Sem conteúdo (DELETE)                               |
| `400`  | Request inválido (validação de DTO)                 |
| `401`  | Não autenticado (token ausente ou inválido)         |
| `403`  | Não autorizado (sem permissão para o recurso)       |
| `404`  | Recurso não encontrado                              |
| `409`  | Conflito (ex: e-mail já cadastrado)                 |
| `422`  | Entidade não processável (regra de negócio violada) |
| `500`  | Erro interno — nunca expor detalhes ao cliente      |

## Module Slugs — Fonte de Verdade

- `bars-restaurants` → slug canônico do módulo Bares & Restaurants.
- `home-services` → slug canônico oficial do módulo residencial.

### Compatibilidade de transição (legado)

- O alias legado `freela-em-casa` permanece aceito temporariamente para backward compatibility.
- Sempre que recebido, o backend normaliza internamente para o contexto canônico `home-services`.
- Novas integrações devem enviar e persistir a referência usando `home-services`.

## Endpoints

## Observações de Geolocalização (backend-first)

- Para create/update de **providers** e **contractors** (BR e Casa), o backend aplica precedência de coordenadas:
  1. usa `latitude`/`longitude` do payload quando enviadas;
  2. caso ausentes, tenta geocoding com CEP/endereço.
- Em falha de geocoding (timeout, indisponibilidade externa ou sem resultado), o cadastro/atualização **não deve quebrar**: o registro é persistido sem coordenadas.
- `PUT /v1/bars-restaurants/contractors` aceita atualização de endereço e coordenadas (`cep`, `street`, `neighborhood`, `city`, `uf`/`state`, `number`, `latitude`, `longitude`) mantendo compatibilidade com payload anterior.
- Para **vacancies** (create/update), o contrato atual não expõe campos de latitude/longitude no schema; portanto, não há persistência de coordenadas de vaga nesta etapa para evitar quebra de compatibilidade.
- Para listagem de vagas no contexto **provider** (`GET /v1/bars-restaurants/vacancies` e `GET /v1/home-services/vacancies`), o backend aplica filtro geográfico de 30km por distância entre provider e contractor quando ambos possuem coordenadas.
- Se faltarem coordenadas em dados legados de provider ou contractor, ou se houver sentinela legado `0,0`, a listagem mantém a vaga elegível pelos demais filtros para evitar feed vazio enquanto os perfis são geocodificados. Perfil provider inexistente continua retornando lista vazia.

> Os endpoints abaixo são o mapeamento de rotas definido pelo Arquiteto em `docs/architecture.md`.
> Payloads de request/response são preenchidos pelo Dev Backend durante a implementação.

### Shared Kernel — Payments / Attendance Confirmation (`/v1/jobs/:id/attendance-confirmation`)

| Método | Path                                                  | Auth | Descrição |
| ------ | ----------------------------------------------------- | ---- | --------- |
| `POST` | `/v1/jobs/:id/attendance-confirmation/open`           | ✅   | Abre fluxo quando faltar check-in/check-out no prazo |
| `POST` | `/v1/jobs/:id/attendance-confirmation/contractor-decision` | ✅   | Decisão do contratante (`decision=true/false`) |
| `POST` | `/v1/jobs/:id/attendance-confirmation/provider-decision`   | ✅   | Decisão do freelancer quando contratante negar |
| `GET`  | `/v1/jobs/:id/attendance-confirmation`                | ✅   | Consulta status do fluxo |

**Headers opcionais de idempotência:**
- `Idempotency-Key: <string>`

**Regras de transição (máquina de estados):**
- `PENDING_CONTRACTOR_CONFIRMATION` + contratante `SIM` → `REPASSE_RELEASED`
- `PENDING_CONTRACTOR_CONFIRMATION` + contratante `NÃO` → `PENDING_PROVIDER_CONFIRMATION`
- `PENDING_PROVIDER_CONFIRMATION` + freelancer `SIM` → `SUPPORT_TICKET_REQUESTED`
- `PENDING_PROVIDER_CONFIRMATION` + freelancer `NÃO` → `REFUND_REQUESTED`

### Shared Kernel — Auth (`/v1/users`, `/v1/admins`)

| Método | Path                                                 | Auth | Descrição                                    |
| ------ | ---------------------------------------------------- | ---- | -------------------------------------------- |
| `POST` | `/v1/users/login`                                    | ❌   | Login de usuário                             |
| `POST` | `/v1/users/register`                                 | ❌   | Registro de usuário                          |
| `POST` | `/v1/users/forgot-password`                          | ❌   | Solicita código para redefinição de senha    |
| `POST` | `/v1/users/reset-password`                           | ❌   | Redefine senha com código de recuperação     |
| `POST` | `/v1/users/google/connect`                           | ❌   | Login/registro via Google                    |
| `GET`  | `/v1/users/me/notification-settings`                 | ✅   | Lê preferências de notificação do usuário    |
| `PUT`  | `/v1/users/me/notification-settings`                 | ✅   | Atualiza preferências de notificação         |
| `GET`  | `/v1/users/generate-email-confirmation-code`         | ✅   | Gera código de confirmação de e-mail         |
| `GET`  | `/v1/users/generate-email-confirmation-code/:email`  | ❌   | Reenvia código para e-mail não confirmado    |
| `POST` | `/v1/users/confirm-email`                            | ❌   | Confirma e-mail com código                   |
| `POST` | `/v1/users/auth/refresh`                             | ❌   | Renova access token                          |
| `GET`  | `/v1/users/contractors/me/financial-summary`         | ✅   | Resumo financeiro do contratante autenticado |
| `GET`  | `/v1/users/providers/me/financial-summary`           | ✅   | Resumo financeiro do provider autenticado    |
| `GET`  | `/v1/users/providers/me/feedbacks`                   | ✅   | Feedbacks recebidos do provider autenticado  |
| `PUT`  | `/v1/users/providers/me`                             | ✅   | Atualiza perfil global do provider           |
| `GET`  | `/v1/users/providers/check-cpf`                      | ✅   | Verifica disponibilidade/validade de CPF     |
| `POST` | `/v1/admins/login`                                   | ❌   | Login de admin                               |
| `POST` | `/v1/admins/register`                                | ❌   | Registro de admin                            |
| `POST` | `/v1/admins/google/connect`                          | ❌   | Login/registro admin via Google              |
| `GET`  | `/v1/admins/generate-email-confirmation-code/:email` | ✅   | Gera código de confirmação de e-mail (admin) |
| `POST` | `/v1/admins/confirm-email`                           | ❌   | Confirma e-mail de admin                     |
| `POST` | `/v1/admins/auth/refresh`                            | ❌   | Renova access token (admin)                  |

### Shared Kernel — Public

| Método | Path                          | Auth | Descrição                         |
| ------ | ----------------------------- | ---- | --------------------------------- |
| `GET`  | `/v1/public/landing-snapshot` | ❌   | Snapshot público para landing/app |

#### POST /v1/users/register

**Auth:** None

**Objetivo do endpoint:**

- Criar conta e perfil inicial em **uma única requisição** no **fluxo novo**.
- Manter **compatibilidade temporária** com o payload legado durante a migração.
- Aplicar decisão de negócio:
  - **Provider (freelancer): unificado** entre módulos.
  - **Contractor (contratante): permanece separado por módulo** (`bars-restaurants` e `home-services`).

**Request (fluxo novo — provider unificado):**

```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "phoneNumber": "+5511999999999",
  "password": "StrongPass1!",
  "persona": "provider",
  "providerProfile": {
    "jobTitle": "Garçom",
    "bio": "Experiência em eventos",
    "cityId": "city-uuid",
    "avatarUrl": "https://cdn.example.com/avatar.jpg"
  }
}
```

**Request (fluxo novo — contractor por módulo):**

```json
{
  "name": "Maria Souza",
  "email": "maria@example.com",
  "phoneNumber": "+5511888888888",
  "password": "StrongPass1!",
  "persona": "contractor",
  "module": "bars-restaurants",
  "contractorProfile": {
    "companyName": "Restaurante Bom Sabor",
    "document": "12345678000199",
    "segment": "eventos",
    "cityId": "city-uuid",
    "avatarUrl": "https://cdn.example.com/avatar.jpg",
    "photos": ["https://cdn.example.com/photo1.jpg"]
  }
}
```

**Compatibilidade temporária (fluxo legado):**

```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "phoneNumber": "+5511999999999",
  "password": "StrongPass1!",
  "status": "active"
}
```

**Request rules:**

- `status` is optional and accepted for backward compatibility with legacy clients.
- When provided, `status` must be exactly `"active"`.
- Omitted `status` keeps default active behavior.

**Business behavior:**

- Creates user with `emailConfirmed = false`.
- Generates and sends e-mail confirmation code.
- **Does not authenticate immediately** (no access/refresh tokens in register response).
- Initial e-mail state after signup: `PENDING_CONFIRMATION`.

**Response 201:**

```json
{
  "data": {
    "message": "User registered successfully. Email confirmation is required before login.",
    "emailStatus": "PENDING_CONFIRMATION",
    "user": {
      "id": "user-uuid",
      "name": "João Silva",
      "email": "user@example.com",
      "phoneNumber": "+5511999999999"
    }
  }
}
```

**Response 201 (provider):**

```json
{
  "data": {
    "message": "User registered successfully. Email confirmation is required before login.",
    "emailStatus": "PENDING_CONFIRMATION",
    "user": {
      "id": "user-uuid",
      "name": "João Silva",
      "email": "user@example.com",
      "phoneNumber": "+5511999999999"
    },
    "persona": "provider",
    "provider": {
      "id": "provider-uuid",
      "jobTitle": "Garçom",
      "cityId": "city-uuid"
    }
  }
}
```

**Response 201 (contractor):**

```json
{
  "data": {
    "message": "User registered successfully. Email confirmation is required before login.",
    "emailStatus": "PENDING_CONFIRMATION",
    "user": {
      "id": "user-uuid",
      "name": "Maria Souza",
      "email": "maria@example.com",
      "phoneNumber": "+5511888888888"
    },
    "persona": "contractor",
    "module": "bars-restaurants",
    "contractor": {
      "id": "contractor-uuid",
      "companyName": "Restaurante Bom Sabor",
      "cityId": "city-uuid"
    }
  }
}
```

**Errors:**

- `400` payload inválido/sintaxe inválida (campos obrigatórios ausentes, `module` inválido, combinação inválida entre `persona` e perfis)
- `409` conflito de unicidade (ex.: e-mail já cadastrado)
- `422` regra de negócio violada (ex.: cidade não elegível)

#### POST /v1/users/login

**Auth:** None

**Request:**

```json
{
  "email": "user@example.com",
  "password": "StrongPass1!"
}
```

**Response 200:**

```json
{
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "emailConfirmed": true,
      "userType": "provider"
    },
    "onboarding": {
      "isPending": false,
      "nextStep": null
    },
    "context": {
      "modules": ["bares-restaurants", "home-services"],
      "profilesByModule": {
        "bares-restaurants": {
          "providerId": "br-provider-uuid",
          "role": "provider"
        },
        "home-services": {
          "providerId": "casa-provider-uuid",
          "contractorId": "casa-contractor-uuid",
          "role": "both"
        }
      }
    }
  }
}
```

**Auth context behavior (additive / backward compatible):**

- `context.modules` returns the module slugs where the authenticated user has at least one business profile.
  - Possible values: `"bares-restaurants"`, `"home-services"`.
- `context.profilesByModule` returns profile IDs by module:
  - `providerId` when the user has provider profile in that module.
  - `contractorId` when the user has contractor profile in that module.
  - `role` when applicable: `"provider"` or `"contractor"`.
- This block is **additive** and does not remove/rename any previous login fields.

**Perfil exclusivo (regra obrigatória):**

- O usuário autenticado deve possuir contexto de negócio exclusivo: `provider` **ou** `contractor`.
- A resposta de login **não** deve retornar `role: "both"` em `context.profilesByModule`.
- Se o backend detectar coexistência indevida de perfis (dados legados inconsistentes), o login retorna:
  - `401 PROFILE_EXCLUSIVITY_VIOLATION`.

**Onboarding behavior:**

- `user.userType` values:
  - `"provider"` when user already has provider profile.
  - `"contractor"` when user already has contractor profile.
  - `null` when user still has no business profile.
- `onboarding.isPending` is `true` when `userType = null`.
- `onboarding.nextStep` is aditive and currently returns:
  - `"CREATE_PROVIDER_OR_CONTRACTOR_PROFILE"` when onboarding is pending.
  - `null` when onboarding is complete.

**Errors:**

- `401` Invalid credentials.
- `401` `EMAIL_NOT_CONFIRMED` when e-mail is still pending confirmation.
- `401` Account temporarily locked. Try again later.
- `401` `EMAIL_NOT_CONFIRMED` — Email confirmation is required before login.
- `401` `PROFILE_EXCLUSIVITY_VIOLATION` — User has conflicting profiles (provider and contractor).

**Canonical e-mail identity behavior (hardening):**

- Auth endpoints normalize e-mail identifiers with `trim + lowercase` for comparison and lookup.
- This applies to at least: `register`, `login`, `confirm-email`, `forgot-password`, `reset-password`, and `google/connect`.
- Goal: prevent false-positive `EMAIL_NOT_CONFIRMED` caused by case/whitespace mismatches between confirmation and login payloads.

**Example 401 (email not confirmed):**

```json
{
  "error": {
    "code": "EMAIL_NOT_CONFIRMED",
    "message": "Email not confirmed. Please confirm your email before logging in."
  }
}
```

#### POST /v1/users/auth/refresh

**Auth:** None (requires valid refresh token in body)

**Request:**

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response 200:**

```json
{
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "emailConfirmed": true,
      "userType": null
    },
    "onboarding": {
      "isPending": true,
      "nextStep": "CREATE_PROVIDER_OR_CONTRACTOR_PROFILE"
    }
  }
}
```

**Errors:** 401, 404

#### POST /v1/users/google/connect

**Auth:** None

**Request:**

```json
{
  "googleId": "google-sub-id",
  "email": "user@example.com",
  "name": "João Silva"
}
```

**Response 200:**

```json
{
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "emailConfirmed": true,
      "userType": "contractor"
    },
    "onboarding": {
      "isPending": false,
      "nextStep": null
    }
  }
}
```

**Errors:** 400, 401, 500

#### OpenPix/Woovi — create charge PIX e parsing de resposta

- **Create charge:** backend envia `correlationID`, `value` e `comment` na criação da cobrança PIX.
- **Base URL:** normalização evita duplicidade de path (`/api/v1`) ao montar endpoint de cobrança.
- **Parsing de resposta:** backend normaliza campos do OpenPix/Woovi para contrato interno:
  - `paymentLinkUrl`/`link` -> `paymentLinkUrl`
  - `paymentMethods.pix.qrCodeImage`/legado `qrCodeImage` -> `qrCodeImage`
  - `paymentMethods.pix.brCode`/legado `brCode` -> `brCode`
  - `correlationID`/`correlationId` -> `correlationId`

#### POST /v1/users/confirm-email

**Auth:** None

**Request:**

```json
{
  "code": "123456",
  "userId": "user-uuid",
  "email": "user@example.com"
}
```

**Request rules:**

- `code` is required.
- Provide at least one identifier: `userId` or `email`.
- Backward compatibility: payloads with only `email` or only `userId` are supported.
- When both `userId` and `email` are provided, they **must** refer to the same account.
- If `userId` and `email` do not match, API returns `400` with semantic error `EMAIL_CONFIRMATION_IDENTIFIER_MISMATCH`.

**Response 200:**

```json
{
  "data": {
    "message": "Email confirmed successfully.",
    "emailStatus": "CONFIRMED"
  }
}
```

**Idempotent behavior:**

- If the e-mail is already confirmed, endpoint still returns `200` with:

```json
{
  "data": {
    "message": "Email is already confirmed.",
    "emailStatus": "ALREADY_CONFIRMED"
  }
}
```

**Errors:** 400 (invalid code or identifier mismatch), 404 (user not found), 500

#### GET /v1/users/generate-email-confirmation-code/:email

**Auth:** None (**endpoint público, sem JWT**)

**Path params:**

- `email` (required)

**Response 200:**

```json
{
  "data": {
    "message": "Confirmation code generated."
  }
}
```

**Business behavior:**

- If account exists and `emailConfirmed = false`, backend:
  - generates a **new** 6-digit confirmation code,
  - invalidates the previous code,
  - dispatches confirmation e-mail with the latest code,
  - returns `200`.
- If account is already confirmed, endpoint returns `200` sem regenerar código (comportamento idempotente/no-op).
- Endpoint is rate limited (`3 req / 60s` por origem). When exceeded, returns `429` (`TOO_MANY_REQUESTS`).

**Status codes (implementação atual):**

- `200` `Confirmation code generated.`
- `404` `User not found.`
- `429` Too many requests

#### POST /v1/users/forgot-password

**Auth:** None

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response 200:**

```json
{
  "data": {
    "message": "If the email exists, a password reset code was sent."
  }
}
```

**Business behavior:**

- If email exists: generates unique reset code, invalidates previous tokens for that user, stores token with `expiresAt = now + 15 minutes`, triggers email delivery with the code.
- If email does not exist: returns same generic response (anti-enumeration).

**Errors:**

- `400` Invalid payload (missing/invalid email)

#### POST /v1/users/reset-password

**Auth:** None

**Request:**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "StrongPass1!"
}
```

**Response 200:**

```json
{
  "data": {
    "message": "Password reset successfully."
  }
}
```

**Business behavior:**

- Validates the recovery code exists, belongs to the provided email, is not expired and not used.
- Updates user password using hash.
- Marks reset code as used (`used = true`).
- Invalidates active refresh token/session for the email (BR-FP06).

**Errors:**

- `400` Invalid payload (missing/invalid `email`, `code` or `password`)
- `401` Invalid, used or expired recovery code

### Shared Kernel — Profile

| Método  | Path                    | Auth     | Descrição                     |
| ------- | ----------------------- | -------- | ----------------------------- |
| `GET`   | `/v1/users/profile`     | ✅       | Perfil do usuário autenticado |
| `GET`   | `/v1/users/me`          | ✅       | Perfil do usuário autenticado |
| `PUT`   | `/v1/users/profile`     | ✅       | Atualiza perfil (name/avatar) |
| `GET`   | `/v1/users/:id`         | ✅       | Perfil de um usuário por ID   |
| `PUT`   | `/v1/users`             | ✅       | Atualiza perfil do usuário    |
| `PATCH` | `/v1/users/:id/disable` | ✅ Admin | Desativa usuário              |
| `GET`   | `/v1/cities`            | ❌       | Lista cidades disponíveis     |

> Compatibilidade: `/v1/users/me` e `PUT /v1/users` continuam válidos para clientes legados.

#### GET /v1/users/profile

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "profile-uuid",
    "userId": "user-uuid",
    "name": "João Silva",
    "phone": "+5511999999999",
    "avatarUrl": "https://...",
    "cityId": "city-uuid",
    "emailConfirmed": true,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 401, 404, 500

#### PUT /v1/users/profile

**Auth:** Bearer JWT (user)

**Request (partial):**

```json
{
  "name": "Novo Nome",
  "avatarUrl": "https://..."
}
```

**Response 200:**

```json
{
  "data": {
    "id": "profile-uuid",
    "userId": "user-uuid",
    "name": "Novo Nome",
    "phone": "+5511999999999",
    "avatarUrl": "https://...",
    "cityId": "city-uuid",
    "emailConfirmed": true,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 404, 500

### Shared Kernel — Notifications

| Método | Path                                    | Auth     | Descrição                  |
| ------ | --------------------------------------- | -------- | -------------------------- |
| `POST` | `/v1/users/notification-subscriptions`  | ✅       | Subscrição push de usuário |
| `POST` | `/v1/admins/notification-subscriptions` | ✅ Admin | Subscrição push de admin   |

#### POST /v1/users/notification-subscriptions

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/xyz",
  "p256dhKey": "p256dh-key",
  "authKey": "auth-key"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "endpoint": "https://fcm.googleapis.com/fcm/send/xyz",
    "createdAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 422, 500

#### POST /v1/admins/notification-subscriptions

**Auth:** Bearer JWT (admin)

**Request:**

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/xyz",
  "p256dhKey": "p256dh-key",
  "authKey": "auth-key"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "adminId": "uuid",
    "endpoint": "https://fcm.googleapis.com/fcm/send/xyz",
    "createdAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 403, 422, 500

### Shared Kernel — Uploads

| Método | Path                 | Auth | Descrição                                 |
| ------ | -------------------- | ---- | ----------------------------------------- |
| `POST` | `/v1/uploads/avatar` | ✅   | Upload global de avatar do usuário (S3/CDN) |

#### POST /v1/uploads/avatar

**Auth:** Bearer JWT (user)

**Content-Type:** `multipart/form-data`

**Request body (multipart):**

- `file` (obrigatório): imagem de avatar

**Validações obrigatórias:**

- Mime types permitidos: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: `5MB`
- Ownership: key é gerada internamente pelo backend contendo `userId` autenticado; o cliente **não** envia path/key

**Response 201:**

```json
{
  "data": {
    "url": "https://cdn.example.com/freela/avatars/user-uuid/4f6f4d8c-avatar.webp",
    "key": "freela/avatars/user-uuid/4f6f4d8c-avatar.webp",
    "mimeType": "image/webp",
    "size": 48231,
    "uploadedAt": "2026-04-17T18:45:00.000Z"
  }
}
```

**Errors:** 400, 401, 413, 415, 500

**Comportamento interno (sem breaking de contrato):**

- Backend cria a cobrança PIX no OpenPix/Woovi usando o `:id` do job como `correlationId` canônico.
- Contrato público de request/response para front/mobile permanece inalterado.

### Provider onboarding (GLOBAL) — regra oficial

- **Provider é GLOBAL por usuário** (ADR-012). O cadastro canônico de provider é feito em endpoint global do Shared Kernel:
  - `POST /v1/users/providers`
- **Leitura canônica de provider (GLOBAL):**
  - `GET /v1/users/providers/me` (leitura própria autenticada)
  - `GET /v1/users/providers/:id` (leitura pública sanitizada para análise de candidato por contractor autenticado)
- **Diretriz de integração:** **não usar rotas de provider por módulo para novas integrações**. Elas permanecem apenas por compatibilidade legada/deprecada.
- Endpoints de provider por módulo **não são endpoint de onboarding global**:
  - `POST /v1/bars-restaurants/providers`
  - `POST /v1/home-services/providers` (alias legado: `POST /v1/freela-em-casa/providers`)
- Esses endpoints de módulo existem para projeção/compatibilidade contextual e exigem que o onboarding global já tenha ocorrido.
- Quando o usuário tenta criar provider por endpoint de módulo sem provider global prévio, a API retorna:
  - `422 PROVIDER_GLOBAL_ONBOARDING_ROUTE_REQUIRED`
  - Mensagem orientativa para usar `POST /v1/users/providers`.

#### POST /v1/users/providers

**Auth:** Bearer JWT (user)

**Request (canônico — payload completo aceito):**

```json
{
  "providerProfile": {
    "cpf": "860.550.060-30",
    "birthDate": "20/03/1987",
    "sex": "masculino",
    "hasPcd": true,
    "deficiencyType": ["Autismo (TEA)"],
    "desiredJobVacancy": ["Barista", "Barman/Bartender", "Garçom/Garçonete"],
    "availability": [
      { "key": "tue", "label": "Ter", "active": true, "start": "12:00", "end": "22:00" },
      { "key": "wed", "label": "Qua", "active": true, "start": "12:00", "end": "23:00" }
    ],
    "address": {
      "cep": "13201-040",
      "street": "Rua Doutor Almeida",
      "number": "554",
      "complement": "",
      "neighborhood": "Centro",
      "city": "Jundiaí",
      "state": "SP"
    },
    "pixKeyType": "telefone",
    "pixKey": "(99) 99999-9999",
    "emergencyContact": {
      "name": "Eu cLONE",
      "relationship": "Outro",
      "phone": "(99) 99999-9999"
    }
  }
}
```

**Compatibilidade com payload anterior (mantida):**

- Campos antigos continuam aceitos: `jobTitle`, `bio`, `cityId`, `avatarUrl`, `services`, `availability`.
- `desiredJobVacancy` também é aceito e mapeado para `services` quando `services` não for enviado.
- Formato legado de disponibilidade segue aceito: `providerProfile.diasAtivos` + `providerProfile.horarios`.

**Mapeamento e persistência (provider global):**

- O onboarding global cria/garante identidade canônica em `shared.provider_globals` e projeta provider nos dois módulos:
  - `bares_restaurantes.providers`
  - `freela_em_casa.providers`
- Campos persistidos de forma consistente:
  - comuns: `jobTitle`, `bio`, `cityId`, `avatarUrl`, `services/specialties`, `availability`
  - endereço: `address.cep/street/neighborhood/city/state|uf/number`
  - dados pessoais/contextuais globais: `cpf`, `birthDate`, `sex`, `hasPcd`, `emergencyContact`
- Chave Pix no onboarding global:
  - quando `pixKeyType` + `pixKey` são enviados, backend cria chave default (`isDefault=true`) em ambos módulos (`pix_keys`).
- Campo aceito por compatibilidade de frontend:
  - `deficiencyType` é aceito no payload sem erro de validação (não quebra contrato atual).

**Compatibilidade legada (availability):**

- `providerProfile.diasAtivos` + `providerProfile.horarios` ainda são aceitos temporariamente.
- O backend tenta normalizar para `availability` canônico.
- Se a normalização falhar, retorna `422 PROVIDER_AVAILABILITY_LEGACY_INVALID` com mensagem orientativa.

**Response 201:**

```json
{
  "data": {
    "provider": {
      "id": "provider-uuid",
      "jobTitle": "Garçom",
      "cityId": "city-uuid"
    },
    "scope": "global",
    "message": "Provider profile created globally. Module endpoints under /providers are contextual and do not replace global onboarding."
  }
}
```

**Errors:**

- `409` Provider já existe globalmente
- `422` `PROVIDER_AVAILABILITY_LEGACY_INVALID`
- `422` `PROVIDER_GLOBAL_ONBOARDING_ROUTE_REQUIRED` (quando fluxo indevido acontece em endpoint de módulo)

#### GET /v1/users/providers/me

**Auth:** Bearer JWT (user)

**Objetivo:**

- Endpoint canônico de leitura do provider global autenticado (fonte de verdade para front/mobile).
- Retorna perfil global + IDs contextuais por módulo de forma **aditiva**.

**Response 200:**

```json
{
  "data": {
    "id": "provider-global-uuid",
    "userId": "user-uuid",
    "isActive": true,
    "createdAt": "2026-04-14T10:00:00.000Z",
    "updatedAt": "2026-04-14T10:00:00.000Z",
    "contextProfileIds": {
      "bars-restaurants": "br-provider-uuid",
      "home-services": "home-provider-uuid"
    },
    "profile": {
      "jobTitle": "Garçom",
      "bio": "Experiência em eventos",
      "cityId": "city-uuid",
      "avatarUrl": null,
      "services": ["Garçom", "Bartender"],
      "availability": [
        { "key": "mon", "label": "Segunda", "active": true, "start": "08:00", "end": "18:00" }
      ],
      "cpf": "86055006030",
      "birthDate": "1987-03-20T00:00:00.000Z",
      "sex": "masculino",
      "hasPcd": true,
      "emergencyContact": {
        "name": "Contato",
        "phone": "(99) 99999-9999"
      },
      "address": {
        "cep": "13201040",
        "street": "Rua Doutor Almeida",
        "neighborhood": "Centro",
        "city": "Jundiaí",
        "uf": "SP",
        "number": "554"
      }
    }
  }
}
```

**Errors:** 401, 404, 500

#### GET /v1/users/providers/:id

**Auth:** Bearer JWT (user)

**Objetivo:**

- Endpoint canônico global para contractor autenticado consultar candidato por `providerGlobalId`.
- Resposta **sanitizada pública** (sem dados sensíveis do provider).

**Compatibilidade de entrada (sem breaking):**

- O parâmetro `:id` aceita prioritariamente `providerGlobalId`.
- Durante a transição de clientes legados, também são aceitos IDs contextuais de provider por módulo (`bars-restaurants.providers.id` e `freela_em_casa.providers.id`), com resolução interna para o perfil global canônico.

**Response 200 (sanitizado):**

```json
{
  "data": {
    "id": "provider-global-uuid",
    "name": "João Silva",
    "isActive": true,
    "createdAt": "2026-04-14T10:00:00.000Z",
    "updatedAt": "2026-04-14T10:00:00.000Z",
    "averageRating": 4.67,
    "completedJobsCount": 12,
    "contextProfileIds": {
      "bars-restaurants": "br-provider-uuid",
      "home-services": "home-provider-uuid"
    },
    "profile": {
      "jobTitle": "Garçom",
      "bio": "Experiência em eventos",
      "cityId": "city-uuid",
      "avatarUrl": null,
      "services": ["Garçom", "Bartender"],
      "availability": [
        { "key": "mon", "label": "Segunda", "active": true, "start": "08:00", "end": "18:00" }
      ]
    }
  }
}
```

**Campos de resposta (`data`):**

| Campo | Tipo | Obrigatório | Semântica |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | `providerGlobalId` canônico |
| `name` | `string \| null` | ✅ | Nome canônico do provider (fonte: `shared.user_profiles.name`) |
| `isActive` | `boolean` | ✅ | Status atual do provider global |
| `createdAt` | `string (ISO-8601)` | ✅ | Data de criação do provider global |
| `updatedAt` | `string (ISO-8601)` | ✅ | Data da última atualização do provider global |
| `averageRating` | `number \| null` | ✅ | Média de avaliações do provider (contratantes BR + Casa); `null` quando não há avaliações |
| `completedJobsCount` | `number` | ✅ | Quantidade de jobs concluídos (BR + Casa) com deduplicação por job/vaga; `0` quando não há jobs concluídos |
| `contextProfileIds` | `object` | ✅ | IDs contextuais por módulo (`bars-restaurants`, `home-services`) |
| `profile` | `object` | ✅ | Recorte público/sanitizado do perfil global |

**Semântica de `name` (fonte canônica):**

- `name` vem de `shared.user_profiles.name` do usuário dono do `providerGlobalId` resolvido canonicamente.

**Semântica de `averageRating` (aditivo, sem breaking):**

- Fonte de dados: feedbacks com `role = CONTRACTOR` dos módulos `bares-restaurantes` e `home-services`.
- Escopo: somente jobs/vagas em que o provider consultado foi aceito (`candidacies.status = ACCEPTED`) via `providerGlobalId`.
- Fórmula: média simples ponderada por quantidade total de avaliações (não é média de médias por módulo).
- Arredondamento: 2 casas decimais.
- Sem avaliações: retorna `null`.

**Semântica de `completedJobsCount` (aditivo, sem breaking):**

- Fonte de dados: candidaturas dos módulos `bares-restaurants` e `home-services`.
- Escopo: somente candidaturas do provider consultado com `status = ACCEPTED` e job da vaga com `status = COMPLETED`.
- Contagem: soma de jobs **únicos** concluídos por módulo (deduplicação por vaga/job para evitar dupla contagem em cenários de múltiplos serviços na mesma vaga).
- Sem jobs concluídos: retorna `0`.

**Campos sensíveis não expostos nesta rota:** `cpf`, `birthDate`, `sex`, `hasPcd`, `emergencyContact`, `address`, `userId`.

**Errors:** 401, 404, 500

### Onboarding enforcement for business endpoints

For authenticated business routes (`/v1/bars-restaurants/**`, `/v1/home-services/**`, `/v1/freela-em-casa/**`, `/v1/jobs/**`, `/v1/vacancies/**`), backend enforces profile onboarding before allowing business operations.

**Behavior:**

- If authenticated user has no provider nor contractor profile yet, API returns:
  - `403 PROFILE_ONBOARDING_REQUIRED` with message guiding next step.
- If route requires provider context (`.../providers/...`) and user has no provider profile, API returns `403 PROFILE_ONBOARDING_REQUIRED`.
- If route requires contractor context (`.../contractors/...`) and user has no contractor profile, API returns `403 PROFILE_ONBOARDING_REQUIRED`.
- Onboarding creation routes remain accessible for authenticated users without profile:
  - `POST /v1/users/providers` (global provider onboarding)
  - `POST /v1/bars-restaurants/providers`
  - `POST /v1/bars-restaurants/contractors`
  - `POST /v1/home-services/providers`
  - `POST /v1/home-services/contractors`
  - `POST /v1/freela-em-casa/providers`
  - `POST /v1/freela-em-casa/contractors`

**Example 403 (no business profile yet):**

```json
{
  "error": {
    "code": "PROFILE_ONBOARDING_REQUIRED",
    "message": "Profile onboarding required. Create a provider or contractor profile to continue."
  }
}
```

**Example 403 (provider route without provider profile):**

```json
{
  "error": {
    "code": "PROFILE_ONBOARDING_REQUIRED",
    "message": "Provider profile required. Complete provider onboarding to continue."
  }
}
```

**Example 403 (contractor route without contractor profile):**

```json
{
  "error": {
    "code": "PROFILE_ONBOARDING_REQUIRED",
    "message": "Contractor profile required. Complete contractor onboarding to continue."
  }
}
```

### Shared Kernel — Account Deletion (LGPD)

| Método   | Path                                      | Auth     | Descrição                                             |
| -------- | ----------------------------------------- | -------- | ----------------------------------------------------- |
| `GET`    | `/v1/users/me/deletion-request`           | ✅       | Consulta status atual da solicitação de exclusão      |
| `POST`   | `/v1/users/me/deletion-request`           | ✅       | Preview (`?preview=true`) ou confirmação da exclusão  |
| `DELETE` | `/v1/users/me/deletion-request`           | ✅       | Cancela solicitação pendente de exclusão              |
| `GET`    | `/v1/users/me/deletion-request/cancel`    | ❌ Token | Cancela solicitação via token do link de e-mail       |
| `POST`   | `/v1/admin/users/:id/force-delete`        | ✅ Admin | Exclui e anonimiza conta imediatamente (admin)        |

#### POST /v1/users/me/deletion-request

**Auth:** Bearer JWT (user)

**Query params:**

- `preview` (boolean string, optional):
  - `true` → apenas preview (sem efeitos colaterais)
  - omitido ou `false` → confirma a solicitação de exclusão

**Request body (preview=false):**

```json
{
  "password": "StrongPass1!",
  "reason": "Opcional: desejo encerrar minha conta"
}
```

**Request rules:**

- `password` é obrigatório.
- `reason` é opcional.

**Response 200 (preview=true):**

```json
{
  "data": {
    "openVacancies": 0,
    "activeCandidacies": 0,
    "scheduledAt": "2026-04-08T12:00:00.000Z",
    "hasImpediments": false
  }
}
```

**Response 200 (preview=false):**

```json
{
  "data": {
    "scheduledAt": "2026-04-08T12:00:00.000Z",
    "cancellationToken": "f4e1..."
  }
}
```

**Errors:** 400, 401, 404, 422, 500

#### POST /v1/admin/users/:id/force-delete

**Auth:** Bearer JWT (admin)

**Request body:**

```json
{
  "reason": "Usuário publicou conteúdo fraudulento e violou os termos"
}
```

**Request rules:**

- `reason` é obrigatório (mínimo 20 caracteres).

**Response 200:**

```json
{
  "data": {
    "message": "Account deleted and anonymized successfully."
  }
}
```

**Errors:** 400, 401, 403, 404, 500

### Shared Kernel — Payments

| Método | Path                              | Auth       | Descrição                    |
| ------ | --------------------------------- | ---------- | ---------------------------- |
| `POST` | `/v1/payments/webhooks/payment`   | ❌ Webhook | Webhook de pagamento OpenPix/Woovi |
| `POST` | `/v1/jobs/:id/payments`           | ✅         | Inicia pagamento de um job   |
| `GET`  | `/v1/jobs/:id/payments`           | ✅         | Consulta pagamento de um job |
| `POST` | `/v1/vacancies/jobs/payments`     | ✅         | Inicia pagamento de vaga/job |
| `GET`  | `/v1/vacancies/:id/jobs/payments` | ✅         | Consulta pagamento de vaga   |

#### POST /v1/jobs/:id/payments

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "value": 10000,
  "comment": "Payment for job"
}
```

**Response 201:**

```json
{
  "data": {
    "id": "job-id",
    "status": "PENDING",
    "value": 10000,
    "correlationId": "job-id",
    "paymentLinkUrl": null,
    "qrCodeImage": null,
    "brCode": null,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 403, 422, 500

#### GET /v1/jobs/:id/payments

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "job-id",
    "status": "PENDING",
    "value": 10000,
    "correlationId": "job-id",
    "paymentLinkUrl": null,
    "qrCodeImage": null,
    "brCode": null,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 401, 404, 500

#### POST /v1/vacancies/jobs/payments

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "vacancyId": "vacancy-uuid",
  "value": 10000,
  "comment": "Payment for vacancy job"
}
```

**Response 201:**

```json
{
  "data": {
    "id": "vacancy-id",
    "status": "PENDING",
    "value": 10000,
    "correlationId": "vacancy-id",
    "paymentLinkUrl": null,
    "qrCodeImage": null,
    "brCode": null,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 404, 422, 500, 502, 503

**Comportamento interno (sem breaking de contrato):**

- Backend cria a cobrança PIX no OpenPix/Woovi usando `vacancyId` como `correlationId` canônico.
- Contrato de request/response para front/mobile permanece inalterado.

**OpenPix integration error mapping (diagnostic semantics):**

- `401`/`403` do OpenPix → `502 Bad Gateway` com mensagem semântica de falha de autenticação/configuração.
- `4xx` de payload/regra de negócio do OpenPix → `422 Unprocessable Entity` com mensagem semântica.
- timeout/rede/`5xx` do OpenPix → `503 Service Unavailable`.
- Contrato do provedor OpenPix/Woovi:
  - criação de cobrança PIX via `POST /api/v1/charge`
  - consulta por correlação via `GET /api/v1/charge/{correlationId}`

> Segurança: respostas de erro para cliente não expõem tokens/chaves. Logs internos registram contexto sanitizado (status HTTP, código de rede, trecho sanitizado do body e correlationId/vacancyId quando disponível).

#### GET /v1/vacancies/:id/jobs/payments

**Auth:** Bearer JWT (user)

**Behavior (test mode fallback):**

- Default behavior (all environments): backend queries OpenPix/Woovi by `correlationId = :id`.
- Optional fallback for non-production testing:
  - When `PAYMENTS_TEST_MODE=true` **and** `NODE_ENV` is `development` or `staging`, if OpenPix/Woovi returns no payment, backend falls back to local repository lookup (`payments` table) via `findByCorrelationId(:id)`.
- Fail-safe in production:
  - When `NODE_ENV=production`, local fallback is always disabled, even if `PAYMENTS_TEST_MODE=true`.
  - Source of truth remains external provider response.
- Response contract remains unchanged (`200` with `data` object, `404` when not found).

**Response 200:**

```json
{
  "data": {
    "id": "vacancy-id",
    "status": "PENDING",
    "value": 10000,
    "correlationId": "vacancy-id",
    "paymentLinkUrl": null,
    "qrCodeImage": null,
    "brCode": null,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 401, 404, 500

#### POST /v1/payments/webhooks/payment

**Auth:** None (OpenPix/Woovi webhook)

**Headers:**

- `x-webhook-signature`: Assinatura RSA do webhook OpenPix (modo `rsa`)
- `x-openpix-hmac-sha256`: Assinatura HMAC SHA-256 (modo `hmac`)
- `x-openpix-event`: Event name (optional)

**Webhook signature mode (OpenPix):**

- `OPENPIX_WEBHOOK_SIGNATURE_MODE=rsa` → valida `x-webhook-signature` com `OPENPIX_WEBHOOK_PUBLIC_KEY_BASE64`
- `OPENPIX_WEBHOOK_SIGNATURE_MODE=hmac` → valida `x-openpix-hmac-sha256` com `OPENPIX_WEBHOOK_HMAC_SECRET`
- Compatibilidade legado: `OPENPIX_WEBHOOK_SECRET` pode ser usado durante transição

**Request (evento real):**

```json
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": {
    "id": "charge_123",
    "correlationID": "job-uuid",
    "status": "COMPLETED",
    "value": 1000
  }
}
```

**Request (probe/validação de cadastro OpenPix — no-op):**

```json
{}
```

**Request (shape alternativo com `data.payment`):**

```json
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "data": {
    "charge": {
      "id": "charge_123",
      "correlationID": "job-uuid",
      "status": "COMPLETED",
      "amount": 1000
    }
  }
}
```

**Request (compatibilidade pt-BR):**

```json
{
  "evento": "OPENPIX:CHARGE_COMPLETED",
  "data_criacao": "2026-04-07T12:30:00.000Z",
  "cobranca": {
    "id": "charge_123",
    "correlationID": "job-uuid",
    "status": "COMPLETED",
    "amount": 1000
  }
}
```

**Compatibilidade e canonicalização interna:**

- Endpoint aceita formatos (`event`/`payment`, `event`/`charge`, `evento`/`cobranca`).
- Endpoint aceita também shape atual com `data.payment` e `data.charge`.
- Payload recebido é normalizado para shape canônico interno antes do processamento:
  - `event` <- `event` ou `evento`
  - `charge` <- `charge` ou `data.charge` ou `cobranca` (com fallback pontual para `payment` em eventos de movement)
  - `charge.correlationID` <- `correlationID` ou `correlationId`
  - `charge.amount` <- `amount` ou `value`
  - `charge.status` mapeado para internos (`COMPLETED`, `FAILED`, `EXPIRED`, `PENDING`)
- Quando `charge.status` não vier no payload, o backend tenta inferir status a partir do evento (`OPENPIX:CHARGE_COMPLETED`, `OPENPIX:CHARGE_EXPIRED`, `OPENPIX:CHARGE_FAILED`, `OPENPIX:MOVEMENT_*`).
- Segurança mantida: eventos reais exigem assinatura válida (`x-webhook-signature` ou `x-openpix-hmac-sha256`), inválida retorna `401`.
- Idempotência mantida: webhook repetido com mesmo status para o mesmo `correlationID` é ignorado sem reprocessar efeitos colaterais.
- Probe/validação de cadastro (ex.: body vazio `{}` ou payload sem `charge`/`cobranca`): responde `200` em no-op, sem validar assinatura e sem alterar estado/persistência.
- Evento real: quando houver cobrança, ao menos um header de assinatura deve ser enviado. Ausência retorna `400` e assinatura inválida retorna `401`.

**Response 200:**

```json
{
  "data": {
    "message": "Webhook processed."
  }
}
```

**Errors:** 400, 401, 500

---

### Module: Bars & Restaurants

#### Admin

| Método | Path                                                         | Auth     | Descrição                    |
| ------ | ------------------------------------------------------------ | -------- | ---------------------------- |
| `GET`  | `/v1/bars-restaurants/admin/contractors`                     | ✅ Admin | Lista contratantes           |
| `GET`  | `/v1/bars-restaurants/admin/providers`                       | ✅ Admin | Lista prestadores            |
| `GET`  | `/v1/bars-restaurants/admin/open-vacancies`                  | ✅ Admin | Lista vagas abertas          |
| `GET`  | `/v1/bars-restaurants/admin/closed-vacancies`                | ✅ Admin | Lista vagas encerradas       |
| `GET`  | `/v1/bars-restaurants/admin/jobs-in-progress`                | ✅ Admin | Lista jobs em andamento      |
| `GET`  | `/v1/bars-restaurants/admin/closed-jobs`                     | ✅ Admin | Lista jobs encerrados        |
| `GET`  | `/v1/bars-restaurants/admin/contractors/course-certificates` | ✅ Admin | Certificados de contratantes |
| `GET`  | `/v1/bars-restaurants/admin/providers/course-certificates`   | ✅ Admin | Certificados de prestadores  |

#### Contractors

| Método   | Path                                                | Auth | Descrição                         |
| -------- | --------------------------------------------------- | ---- | --------------------------------- |
| `POST`   | `/v1/bars-restaurants/contractors`                  | ✅   | Cria perfil de contratante        |
| `PUT`    | `/v1/bars-restaurants/contractors`                  | ✅   | Atualiza perfil de contratante    |
| `GET`    | `/v1/bars-restaurants/contractors/:id`              | ✅   | Busca contratante por ID          |
| `GET`    | `/v1/bars-restaurants/contractors/cities`           | ✅   | Cidades com contratantes          |
| `GET`    | `/v1/bars-restaurants/contractors/:id/credit-cards` | ✅   | Cartões de crédito do contratante |
| `POST`   | `/v1/bars-restaurants/contractors/credit-cards`     | ✅   | Adiciona cartão de crédito        |
| `DELETE` | `/v1/bars-restaurants/contractors/credit-cards`     | ✅   | Remove cartão de crédito          |
| `GET`    | `/v1/bars-restaurants/contractors/:id/vacancies`    | ✅   | Vagas do contratante              |
| `GET`    | `/v1/bars-restaurants/contractors/:id/future-jobs`  | ✅   | Jobs futuros do contratante       |
| `GET`    | `/v1/bars-restaurants/contractors/:id/active-jobs`  | ✅   | Jobs ativos do contratante        |

**Regra de autorização (escopo do contratante autenticado):**

- `GET /v1/bars-restaurants/contractors/:id/vacancies` e `GET /v1/bars-restaurants/vacancies/contractors/:id` retornam dados **apenas** quando `:id` pertence ao contractor do usuário autenticado.
- Se `:id` não pertencer ao usuário autenticado (ou o usuário não tiver contractor associado), a API retorna `404 Contractor not found.` para evitar enumeração de recursos.
- Se o contractor autenticado não possuir vagas, a API retorna `200` com `data: []` (lista vazia, sem erro).

#### POST /v1/bars-restaurants/contractors

**Auth:** Bearer JWT (user)
**Content-Type:** application/json

**Request:**

- **Form Fields:**
  - `contactName` (string, required): "Maria Oliveira"
  - `contactEmail` (string, required): "contato@empresa.com"
  - `contactPhone` (string, required): "+5511999999999"
  - `cep` (string, required): "01311000"
  - `street` (string, required): "Avenida Paulista"
  - `neighborhood` (string, required): "Bela Vista"
  - `city` (string, required): "São Paulo"
  - `uf` (string, required): "SP"
  - `number` (string, required): "123"
  - `complement` (string, optional): "Sala 4"
  - `latitude` (number, optional): -23.55052
  - `longitude` (number, optional): -46.633308
  - `cnpj` (string, optional): "12345678000199"
  - `corporateReason` (string, optional): "Empresa Exemplo LTDA"
  - `cpf` (string, optional): "12345678900"
  - `birthdate` (string yyyy-mm-dd, optional): "1995-06-12"
  - `companyName` (string, optional): "Restaurante Bom Sabor"
  - `document` (string, optional, legado): "12345678000199"
  - `segment` (string, optional): "eventos"
  - `cityId` (string, optional): "city-uuid"

**Important:** contractor creation does **not** accept image upload (`file`, `imageType`) and does **not** accept `avatarUrl`/`photos` in payload. Image updates remain available only on `PUT /v1/bars-restaurants/contractors`.

**Validation rules:**

- Required address/contact fields must be present and non-empty
- `cnpj`/`cpf` are optional, but when provided they must be valid numeric documents (`14` and `11` digits)
- Empty string or `null` for `cnpj`/`cpf` is rejected (`400`); omit the field when not applicable (PF/PJ)
- `cnpj` and `cpf` are unique across contractors (`409 Conflict` on duplicates)
- Perfil exclusivo: criação bloqueada com `409` quando o usuário já possui perfil provider.

**Geocoding behavior (Nominatim):**

- If `latitude` + `longitude` are sent explicitly in the payload, these values take precedence.
- If coordinates are omitted, backend tries automatic geocoding from address fields (Nominatim).
- If Nominatim fails, contractor creation still succeeds (safe fallback), keeping coordinates as `null`.
- Integration uses dedicated `User-Agent` and conservative usage to respect Nominatim policy and rate limits.

**Response 201:**

```json
{
  "data": {
    "id": "contractor-uuid",
    "userId": "user-uuid",
    "contactName": "Maria Oliveira",
    "contactEmail": "contato@empresa.com",
    "contactPhone": "+5511999999999",
    "cep": "01311000",
    "street": "Avenida Paulista",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "uf": "SP",
    "number": "123",
    "complement": "Sala 4",
    "latitude": -23.55052,
    "longitude": -46.633308,
    "cnpj": "12345678000199",
    "corporateReason": "Empresa Exemplo LTDA",
    "cpf": null,
    "birthdate": null,
    "companyName": "Restaurante Bom Sabor",
    "document": "12345678000199",
    "segment": "eventos",
    "cityId": "city-uuid",
    "avatarUrl": null,
    "photos": [],
    "isActive": true,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 409 (CNPJ/CPF already registered), 422, 500

#### PUT /v1/bars-restaurants/contractors

**Auth:** Bearer JWT (user)
**Content-Type:** multipart/form-data

**Request:**

- **Form Fields:**
  - `companyName` (string, optional): "Novo Nome"
  - `document` (string, optional): "12345678000199"
  - `segment` (string, optional): "gastronomia"
  - `cityId` (string, optional): "city-uuid"
  - `complement` (string, optional): "Sala 4"
  - `profileImage` (string, optional): "https://{bucket}.s3.{region}.amazonaws.com/.../profile.webp"
  - `establishmentFacadeImage` (string, optional): "https://{bucket}.s3.{region}.amazonaws.com/.../facade.webp"
  - `establishmentInteriorImage` (string, optional): "https://{bucket}.s3.{region}.amazonaws.com/.../interior.webp"
  - `avatarUrl` (string, optional): "https://{bucket}.s3.{region}.amazonaws.com/.../avatar.jpg"
  - `photos` (string array, optional): ["https://{bucket}.s3.{region}.amazonaws.com/.../photo1.jpg"]
- **File Upload:**
  - `profileImage` (file, optional): Image file (JPEG/PNG/GIF/WEBP, max 5MB)
  - `establishmentFacadeImage` (file, optional): Image file (JPEG/PNG/GIF/WEBP, max 5MB)
  - `establishmentInteriorImage` (file, optional): Image file (JPEG/PNG/GIF/WEBP, max 5MB)

**Validation rules:**

- Endpoint accepts **only** editable contractor fields listed above (`companyName`, `document`, `segment`, `cityId`, image URLs, `avatarUrl`, `photos`)
- Create-only fields (ex: `contactName`, `contactEmail`, `contactPhone`, address and coordinates) are not part of this contract and must be rejected by DTO validation

**Response 200:**

```json
{
  "data": {
    "id": "contractor-uuid",
    "userId": "user-uuid",
    "companyName": "Novo Nome"
  }
}
```

**Errors:** 400, 401, 404, 422, 500

#### GET /v1/bars-restaurants/contractors/:id

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "contractor-uuid",
    "userId": "user-uuid",
    "companyName": "Restaurante Bom Sabor"
  }
}
```

**Errors:** 401, 404, 500

#### GET /v1/bars-restaurants/contractors/cities

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": ["city-uuid"]
}
```

**Errors:** 401, 500

#### GET /v1/bars-restaurants/contractors/:id/credit-cards

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": [
    {
      "id": "card-uuid",
      "contractorId": "contractor-uuid",
      "lastFour": "4242",
      "brand": "VISA",
      "createdAt": "2026-03-16T12:00:00.000Z"
    }
  ]
}
```

**Errors:** 401, 500

#### POST /v1/bars-restaurants/contractors/credit-cards

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "lastFour": "4242",
  "brand": "VISA",
  "token": "tok_123"
}
```

**Response 201:**

```json
{
  "data": {
    "message": "Credit card added."
  }
}
```

**Errors:** 400, 401, 422, 500

#### DELETE /v1/bars-restaurants/contractors/credit-cards

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "cardId": "card-uuid"
}
```

**Response 200:**

```json
{
  "data": {
    "message": "Credit card removed."
  }
}
```

**Errors:** 400, 401, 422, 500

#### Providers

| Método   | Path                                                    | Auth | Descrição                        |
| -------- | ------------------------------------------------------- | ---- | -------------------------------- |
| `POST`   | `/v1/bars-restaurants/providers`                        | ✅   | Cria perfil de prestador         |
| `PUT`    | `/v1/bars-restaurants/providers`                        | ✅   | Atualiza perfil de prestador     |
| `GET`    | `/v1/bars-restaurants/providers/:id`                    | ✅   | Busca prestador por ID           |
| `GET`    | `/v1/bars-restaurants/providers/cities`                 | ✅   | Cidades com prestadores          |
| `GET`    | `/v1/bars-restaurants/providers/pix-keys`               | ✅   | Chaves Pix do prestador          |
| `POST`   | `/v1/bars-restaurants/providers/pix-keys`               | ✅   | Adiciona chave Pix               |
| `PUT`    | `/v1/bars-restaurants/providers/pix-keys`               | ✅   | Atualiza chave Pix               |
| `DELETE` | `/v1/bars-restaurants/providers/pix-keys`               | ✅   | Remove chave Pix                 |
| `POST`   | `/v1/bars-restaurants/providers/candidacies`            | ✅   | Cria candidatura (atalho provider) |
| `GET`    | `/v1/bars-restaurants/providers/:id/future-jobs`        | ✅   | Jobs futuros do prestador        |
| `GET`    | `/v1/bars-restaurants/providers/:id/active-jobs`        | ✅   | Jobs ativos do prestador         |

#### POST /v1/bars-restaurants/providers

**Auth:** Bearer JWT (user)
**Content-Type:** multipart/form-data

**Request:**

- **Form Fields:**
  - `jobTitle` (string, optional): "Garçom"
  - `bio` (string, optional): "Experiência em eventos"
  - `cep` (string, optional): "01311000"
  - `street` (string, optional): "Avenida Paulista"
  - `neighborhood` (string, optional): "Bela Vista"
  - `city` (string, optional): "São Paulo"
  - `uf` (string, optional): "SP"
  - `number` (string, optional): "123"
  - `latitude` (number, optional): -23.55052
  - `longitude` (number, optional): -46.633308
  - `cityId` (string, optional): "city-uuid"
  - `avatarUrl` (string, optional): "https://{bucket}.s3.{region}.amazonaws.com/.../avatar.jpg"
  - `services` (string[] JSON, optional): ["Garçom", "Bartender"]
  - `availability` (object[] JSON, optional): [{"key":"mon","label":"Segunda","active":true,"start":"08:00","end":"18:00"}]
- **File Upload:**
  - `file` (file, optional): Image file (JPG/PNG/GIF, max 5MB)
  - `imageType` (string, optional): "avatar" (defaults to "avatar")

**Response 201:**

```json
{
  "data": {
    "id": "provider-uuid",
    "userId": "user-uuid",
    "providerGlobalId": "provider-global-uuid",
    "jobTitle": "Garçom",
    "bio": "Experiência em eventos",
    "services": ["Garçom", "Bartender"],
    "availability": [
      {
        "key": "mon",
        "label": "Segunda",
        "active": true,
        "start": "08:00",
        "end": "18:00"
      }
    ],
    "cityId": "city-uuid",
    "avatarUrl": "https://{bucket}.s3.{region}.amazonaws.com/.../avatar.jpg",
    "isActive": true,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "updatedAt": "2026-03-16T12:00:00.000Z"
  }
}
```

> ⚠️ **ADR-012:** `providerGlobalId` é **opcional** (`string | null`). Será `null` até a Fase 3 do rollout do Provider Global. Clientes **não devem** assumir que este campo sempre está presente. Usar somente para fins de diagnóstico/rastreio.

**Errors:** 400, 401, 409, 422, 500

**Validation rules (perfil exclusivo):**

- Criação bloqueada com `409` quando o usuário já possui perfil contractor.

#### PUT /v1/bars-restaurants/providers

**Auth:** Bearer JWT (user)
**Content-Type:** multipart/form-data

**Request:**

- **Form Fields:**
  - `jobTitle` (string, optional): "Barman"
  - `bio` (string, optional): "Experiência em eventos"
  - `cep` (string, optional): "01311000"
  - `street` (string, optional): "Avenida Paulista"
  - `neighborhood` (string, optional): "Bela Vista"
  - `city` (string, optional): "São Paulo"
  - `uf` (string, optional): "SP"
  - `number` (string, optional): "123"
  - `latitude` (number, optional): -23.55052
  - `longitude` (number, optional): -46.633308
  - `cityId` (string, optional): "city-uuid"
  - `avatarUrl` (string, optional): "https://{bucket}.s3.{region}.amazonaws.com/.../avatar.jpg"
  - `services` (string[] JSON, optional): ["Barman", "Garçom"]
  - `availability` (object[] JSON, optional): [{"key":"fri","label":"Sexta","active":true,"start":"18:00","end":"23:00"}]
- **File Upload:**
  - `file` (file, optional): Image file (JPG/PNG/GIF, max 5MB)
  - `imageType` (string, optional): "avatar" (defaults to "avatar")

**Response 200:**

```json
{
  "data": {
    "id": "provider-uuid",
    "userId": "user-uuid",
    "jobTitle": "Barman",
    "services": ["Barman", "Garçom"],
    "availability": [
      {
        "key": "fri",
        "label": "Sexta",
        "active": true,
        "start": "18:00",
        "end": "23:00"
      }
    ]
  }
}
```

**Errors:** 400, 401, 404, 422, 500

#### GET /v1/bars-restaurants/providers/:id

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "provider-uuid",
    "userId": "user-uuid",
    "providerGlobalId": "provider-global-uuid",
    "jobTitle": "Garçom",
    "services": ["Garçom", "Bartender"],
    "availability": [
      {
        "key": "mon",
        "label": "Segunda",
        "active": true,
        "start": "08:00",
        "end": "18:00"
      }
    ]
  }
}
```

> ⚠️ **ADR-012:** `providerGlobalId` é **opcional** (`string | null`). Será `null` até a Fase 3 do rollout do Provider Global.
>
> ⚠️ **Compatibilidade (LEGADO/DEPRECADO para novas integrações):** não usar esta rota modular como contrato principal.
> Use as rotas canônicas globais: `GET /v1/users/providers/me` (próprio) e `GET /v1/users/providers/:id` (consulta pública sanitizada).

**Errors:** 401, 404, 500

#### GET /v1/bars-restaurants/providers/cities

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": ["city-uuid"]
}
```

**Errors:** 401, 500

#### GET /v1/bars-restaurants/providers/pix-keys

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": [
    {
      "id": "pix-uuid",
      "providerId": "provider-uuid",
      "keyType": "CPF",
      "keyValue": "12345678900",
      "isDefault": true,
      "createdAt": "2026-03-16T12:00:00.000Z"
    }
  ]
}
```

**Errors:** 401, 500

#### POST /v1/bars-restaurants/providers/pix-keys

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "keyType": "CPF",
  "keyValue": "12345678900",
  "isDefault": true
}
```

**Response 201:**

```json
{
  "data": {
    "message": "Pix key added."
  }
}
```

**Errors:** 400, 401, 422, 500

#### PUT /v1/bars-restaurants/providers/pix-keys

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "pixKeyId": "pix-uuid",
  "keyType": "CPF",
  "keyValue": "12345678900",
  "isDefault": false
}
```

**Response 200:**

```json
{
  "data": {
    "message": "Pix key updated."
  }
}
```

**Errors:** 400, 401, 422, 500

#### DELETE /v1/bars-restaurants/providers/pix-keys

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "pixKeyId": "pix-uuid"
}
```

**Response 200:**

```json
{
  "data": {
    "message": "Pix key removed."
  }
}
```

**Errors:** 400, 401, 422, 500

#### Vacancies

| Método   | Path                                                | Auth | Descrição            |
| ------- | --------------------------------------------------- | ---- | -------------------- |
| `POST`   | `/v1/bars-restaurants/vacancies`                    | ✅   | Publica vaga         |
| `DELETE` | `/v1/bars-restaurants/vacancies/:id`                | ✅   | Remove vaga          |
| `GET`    | `/v1/bars-restaurants/vacancies/:id`                | ✅   | Busca vaga por ID    |
| `GET`    | `/v1/bars-restaurants/vacancies/contractors/:id`    | ✅   | Vagas por contractor |
| `PATCH`  | `/v1/bars-restaurants/vacancies/:id/jobs/schedule`  | ✅   | Agenda job da vaga   |
| `PATCH`  | `/v1/bars-restaurants/vacancies/:id/jobs/terminate` | ✅   | Encerra job da vaga  |
| `DELETE` | `/v1/bars-restaurants/vacancies/:id/jobs`           | ✅   | Remove job da vaga   |
| `POST`   | `/v1/bars-restaurants/vacancies/:id/cancel`     | ✅   | Cancela candidatura de freelancer (reembolso conforme regra de 2h) |

#### POST /v1/bars-restaurants/vacancies/:id/cancel

**Auth:** Bearer JWT (user - contrator)

**Request:**

```json
{
  "providerId": "provider-uuid"
}
```

**Regras de Negócio:**

1. **Verificação de ownership (BR-SEC07):** Apenas o contrator da vaga pode cancelar
2. **Check-in:** Se o freelancer já fez check-in → erro `422 Freelancer já iniciou o serviço`
3. **Pagamento:** Espera-se que o pagamento esteja `COMPLETED` (job deve existir)
4. **Cálculo de tempo:** `startTime - now()`
   - **≥ 2h antes:** Caso 1 (reembolso 100%)
   - **< 2h antes:** Caso 2 (reembolso 50% + split)
5. **Split do Caso 2:**
   - Contrator recebe 50% de volta
   - Plataforma fica com 10% (20% de 50%)
   - Freelancer perde 40% (não recebe o repasse pendente)

**Response 200:**

```json
{
  "data": {
    "message": "Vacancy cancelled successfully.",
    "vacancyId": "vacancy-uuid",
    "providerId": "provider-uuid",
    "status": "CANCELLED_BY_CONTRACTOR",
    "refundAmount": 10000,
    "refundType": "FULL",
    "checkInExists": false
  }
}
```

**Errors:**

- `404 Vacancy not found.` (quando não é owner ou vaga não existe)
- `404 Accepted candidacy not found for this provider.`
- `422 Freelancer já iniciou o serviço` (check-in já realizado)
- `401` Não autenticado
- `500` Erro interno

#### POST /v1/bars-restaurants/vacancies

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "title": "Garçom para evento",
  "description": "Evento de casamento",
  "serviceType": "GARÇOM/GARÇONETE",
  "date": "2026-03-20",
  "startTime": "2026-03-20T18:00:00.000Z",
  "endTime": "2026-03-20T23:00:00.000Z",
  "address": "Rua X, 123",
  "cityId": "city-uuid"
}
```

**Pricing behavior (server-side, mandatory):**

- `payment` is **not accepted** in request payload.
- Backend calculates pricing from `docs/valor/valor.md` based on vacancy title and module context.
- `cityId` is optional and can be omitted when city comes from external CEP lookup.
- When provided, `cityId` accepts free-text city identifiers (no internal city UUID requirement).
- Validations and computed fields:
  - minimum journey hours (`startTime` → `endTime`)
  - vacancy name mapped to canonical pricing table entry
  - hourly rate
  - total amount
  - platform retention fee (20%)
  - freelancer net amount

**Response 201:**

```json
{
  "data": {
    "id": "vacancy-uuid",
    "contractorId": "contractor-uuid",
    "contractorName": "Maria Souza",
    "contractorCompanyName": "Restaurante Bom Sabor",
    "title": "Garçom para evento",
    "description": "Evento de casamento",
    "serviceType": "eventos",
    "date": "2026-03-20T00:00:00.000Z",
    "startTime": "2026-03-20T18:00:00.000Z",
    "endTime": "2026-03-20T23:00:00.000Z",
    "payment": 15000,
    "address": "Rua X, 123",
    "cityId": "city-uuid",
    "status": "OPEN",
    "createdAt": "2026-03-20T12:00:00.000Z",
    "updatedAt": "2026-03-20T12:00:00.000Z",
    "minimumJourneyHours": 6,
    "hourlyRateInCents": 2500,
    "totalAmountInCents": 15000,
    "retentionFeeInCents": 3000,
    "freelancerNetAmountInCents": 12000
  }
}
```

**Errors:** 400, 401, 422, 500

#### GET /v1/bars-restaurants/vacancies/:id

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "vacancy-uuid",
    "contractorId": "contractor-uuid",
    "title": "Garçom para evento",
    "description": "Evento de casamento",
    "serviceType": "eventos",
    "date": "2026-03-20T00:00:00.000Z",
    "startTime": "2026-03-20T18:00:00.000Z",
    "endTime": "2026-03-20T23:00:00.000Z",
    "payment": 15000,
    "address": "Rua X, 123",
    "cityId": "city-uuid",
    "status": "OPEN",
    "createdAt": "2026-03-20T12:00:00.000Z",
    "updatedAt": "2026-03-20T12:00:00.000Z",
    "minimumJourneyHours": 6,
    "hourlyRateInCents": 2500,
    "totalAmountInCents": 15000,
    "retentionFeeInCents": 3000,
    "freelancerNetAmountInCents": 12000,
    "services": [
      {
        "id": "service-uuid",
        "vacancyId": "vacancy-uuid",
        "serviceType": "eventos",
        "status": "OPEN",
        "quantity": 1,
        "createdAt": "2026-03-20T12:00:00.000Z",
        "updatedAt": "2026-03-20T12:00:00.000Z"
      }
    ]
  }
}
```

**Errors:** 401, 404, 500

#### GET /v1/bars-restaurants/vacancies

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": [
    {
      "id": "vacancy-uuid",
      "contractorId": "contractor-uuid",
      "contractorName": "Maria Souza",
      "contractorCompanyName": "Restaurante Bom Sabor",
      "title": "Garçom para evento",
      "description": "Evento de casamento",
      "serviceType": "eventos",
      "date": "2026-03-20T00:00:00.000Z",
      "startTime": "2026-03-20T18:00:00.000Z",
      "endTime": "2026-03-20T23:00:00.000Z",
      "payment": 15000,
      "address": "Rua X, 123",
      "cityId": "city-uuid",
      "status": "OPEN",
      "createdAt": "2026-03-20T12:00:00.000Z",
      "updatedAt": "2026-03-20T12:00:00.000Z",
      "minimumJourneyHours": 6,
      "hourlyRateInCents": 2500,
      "totalAmountInCents": 15000,
      "retentionFeeInCents": 3000,
      "freelancerNetAmountInCents": 12000,
      "services": [
        {
          "id": "service-uuid",
          "vacancyId": "vacancy-uuid",
          "serviceType": "eventos",
          "status": "OPEN",
          "quantity": 1,
          "createdAt": "2026-03-20T12:00:00.000Z",
          "updatedAt": "2026-03-20T12:00:00.000Z"
        }
      ]
    }
  ]
}
```

**Compatibility note:**

- `POST /v1/bars-restaurants/candidacies` exige `vacancyId` e aceita `vacancyServiceId` opcional **somente** quando a vaga tiver exatamente um serviço.
- Se a vaga tiver múltiplos serviços, `vacancyServiceId` volta a ser obrigatório e o backend retorna `422 VACANCY_SERVICE_ID_REQUIRED` quando omitido.
- O `vacancyServiceId` oficial para o frontend deve ser obtido no campo `services[].id` dos endpoints de vagas (`GET /v1/bars-restaurants/vacancies` e `GET /v1/bars-restaurants/vacancies/:id`).
- Regra freelancer (BR-FL08/BR-FL09): `GET /v1/bars-restaurants/providers/:id/future-jobs` retorna somente itens com pagamento confirmado (`payments.status = COMPLETED`).
- Para distinguir estados no app do freelancer, use `GET /v1/bars-restaurants/candidacies/providers` e leia `data[].freelancerStatus`:
  - `"pendente"` = candidatura aceita e aguardando pagamento.
  - `"agendado"` = candidatura aceita com pagamento confirmado.

#### Candidacies

| Método   | Path                                          | Auth | Descrição                |
| -------- | --------------------------------------------- | ---- | ------------------------ |
| `POST`   | `/v1/bars-restaurants/candidacies`            | ✅   | Cria candidatura         |
| `PATCH`  | `/v1/bars-restaurants/candidacies/accept`     | ✅   | Aceita candidatura       |
| `PATCH`  | `/v1/bars-restaurants/candidacies/reject`     | ✅   | Rejeita candidatura      |
| `GET`    | `/v1/bars-restaurants/candidacies/vacancies/:vacancyId` | ✅   | Lista candidaturas da vaga (com `jobId`) |
| `GET`    | `/v1/bars-restaurants/candidacies/providers`  | ✅   | Lista candidaturas do freelancer autenticado |
| `GET`    | `/v1/bars-restaurants/candidacies/:id`        | ✅   | Busca candidatura por ID (com `jobId`) |

#### POST /v1/bars-restaurants/candidacies

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "vacancyId": "vacancy-uuid",
  "vacancyServiceId": "service-uuid"
}
```

> `vacancyServiceId` é opcional apenas quando a vaga possui exatamente um serviço. Em vagas com múltiplos serviços, envie obrigatoriamente um `services[].id`.

**Response 201:**

```json
{
  "data": {
    "id": "candidacy-uuid",
    "jobId": "job-uuid",
    "providerGlobalId": "provider-global-uuid",
    "status": "PENDING"
  }
}
```

> ⚠️ **ADR-012:** `providerGlobalId` é **opcional** (`string | null`). Será `null` até a Fase 3 do rollout do Provider Global. Clientes **não devem** assumir que este campo sempre está presente.

**Errors:**

- `400` Invalid payload
- `401` Unauthorized
- `404` Vacancy not found
- `404` Vacancy service not found
- `404` Provider not found (authenticated user has no provider profile)
- `409` Duplicated candidacy for same freelancer + vacancy + vacancyService
  - semantic error payload:

```json
{
  "error": {
    "code": "CANDIDACY_ALREADY_EXISTS",
    "message": "You have already applied to this vacancy service."
  }
}
```
- `422` Vacancy is closed
- `422` Vacancy service is closed
- `422` Vacancy service has no available slots (`quantity = 0`)
- `422` `VACANCY_SERVICE_ID_REQUIRED` quando `vacancyServiceId` estiver ausente em vaga com múltiplos serviços
- `500` Internal server error

#### PATCH /v1/bars-restaurants/candidacies/accept

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "candidacyId": "candidacy-uuid"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "candidacy-uuid",
    "status": "ACCEPTED"
  }
}
```

**Errors:** 400, 401, 404, 422, 500

#### PATCH /v1/bars-restaurants/candidacies/reject

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "candidacyId": "candidacy-uuid"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "candidacy-uuid",
    "status": "REJECTED"
  }
}
```

**Errors:** 400, 401, 404, 422, 500

#### GET /v1/bars-restaurants/candidacies/:id

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "candidacy-uuid",
    "providerGlobalId": "provider-global-uuid",
    "status": "PENDING"
  }
}
```

> ⚠️ **ADR-012:** `providerGlobalId` é **opcional** (`string | null`). Será `null` até a Fase 3 do rollout do Provider Global.

**Errors:** 401, 404, 500

#### GET /v1/bars-restaurants/candidacies/providers

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": [
    {
      "id": "candidacy-uuid",
      "vacancyId": "vacancy-uuid",
      "vacancyServiceId": "service-uuid",
      "providerId": "provider-uuid",
      "providerGlobalId": "provider-global-uuid",
      "status": "ACCEPTED",
      "freelancerStatus": "pendente",
      "createdAt": "2026-04-06T10:00:00.000Z",
      "updatedAt": "2026-04-06T10:00:00.000Z"
    }
  ]
}
```

**`freelancerStatus` (additive):**

- `"pendente"`: candidatura `ACCEPTED` com pagamento ainda não confirmado.
- `"agendado"`: candidatura `ACCEPTED` com pagamento confirmado (`payments.status = COMPLETED`).
- `null`: candidaturas que ainda não estão em `ACCEPTED`.

**Errors:** 401, 500

#### Jobs

| Método   | Path                                      | Auth | Descrição        |
| -------- | ----------------------------------------- | ---- | ---------------- |
| `POST`   | `/v1/bars-restaurants/jobs`               | ✅   | Cria/resolve job por vacancy (idempotente) |
| `GET`    | `/v1/bars-restaurants/jobs/by-vacancy/:vacancyId` | ✅   | Busca job por vacancyId |
| `DELETE` | `/v1/bars-restaurants/jobs/:id`           | ✅   | Remove job       |
| `PATCH`  | `/v1/bars-restaurants/jobs/:id/schedule`  | ✅   | Agenda job       |
| `PATCH`  | `/v1/bars-restaurants/jobs/:id/start`     | ✅   | Inicia job       |
| `PATCH`  | `/v1/bars-restaurants/jobs/:id/terminate` | ✅   | Encerra job      |
| `GET`    | `/v1/bars-restaurants/jobs/by-vacancy/:vacancyId` | ✅   | Busca job por vacancyId |
| `GET`    | `/v1/bars-restaurants/jobs/:id`           | ✅   | Busca job por ID |
| `GET`    | `/v1/bars-restaurants/jobs/:jobId/feedback-status` | ✅ | Status de feedback do usuário autenticado |

#### POST /v1/bars-restaurants/jobs

**Auth:** Bearer JWT (user)

**Request:**

```json
{
  "vacancyId": "vacancy-uuid"
}
```

**Response 201:**

```json
{
  "data": {
    "id": "job-uuid",
    "vacancyId": "vacancy-uuid",
    "status": "SCHEDULED"
  }
}
```

**Comportamento:** idempotente; se já existir job para `vacancyId`, retorna o existente.

**Errors:** 400, 401, 404, 422, 500

#### GET /v1/bars-restaurants/jobs/by-vacancy/:vacancyId

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "job-uuid",
    "vacancyId": "vacancy-uuid",
    "status": "SCHEDULED",
    "hasGivenFeedback": false
  }
}
```

**Errors:** 401, 404, 500

#### GET /v1/bars-restaurants/jobs/:id

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "id": "job-uuid",
    "vacancyId": "vacancy-uuid",
    "status": "SCHEDULED",
    "hasGivenFeedback": true
  }
}
```

**Errors:** 401, 404, 500

#### GET /v1/bars-restaurants/jobs/:jobId/feedback-status

**Auth:** Bearer JWT (user)

**Response 200:**

```json
{
  "data": {
    "hasGivenFeedback": true
  }
}
```

**Errors:** 401, 404, 500

#### Check-in / Check-out

| Método | Path                                                        | Auth | Descrição                  |
| ------ | ----------------------------------------------------------- | ---- | -------------------------- |
| `POST` | `/v1/bars-restaurants/contractors/jobs/check-ins/code`      | ✅   | Gera código de check-in (contractor) |
| `GET`  | `/v1/bars-restaurants/contractors/jobs/:jobId/check-ins/status` | ✅ | Status/polling de check-in por job (contractor) |
| `POST` | `/v1/bars-restaurants/providers/jobs/check-ins/validate`    | ✅   | Valida código de check-in  |
| `POST` | `/v1/bars-restaurants/providers/jobs/check-ins`             | ✅   | Registra check-in          |
| `GET`  | `/v1/bars-restaurants/providers/jobs/check-ins/:providerId/jobs/:jobId` | ✅ | Busca check-ins do job (provider) |
| `GET`  | `/v1/bars-restaurants/jobs/:id/check-in-status`             | ✅   | Status do check-in por job |
| `POST` | `/v1/bars-restaurants/contractors/jobs/check-outs/code`     | ✅   | Contratante gera código de check-out/finalização |
| `POST` | `/v1/bars-restaurants/providers/jobs/check-outs/validate`   | ✅   | Valida código de check-out |
| `POST` | `/v1/bars-restaurants/contractors/jobs/check-outs`          | ✅   | Contratante finaliza job após validação |
| `POST` | `/v1/bars-restaurants/providers/jobs/:jobId/check-out`      | ✅   | Provider confirma código e finaliza job (canônico) |
| `GET`  | `/v1/bars-restaurants/contractors/jobs/:jobId/check-outs/status` | ✅ | Status de check-out por job (polling do contratante) |
| `GET`  | `/v1/bars-restaurants/providers/:providerId/jobs/:jobId/check-outs` | ✅ | Busca check-outs do job (provider polling) |

**Rota canônica de finalização pelo provider (fonte de verdade):**

- `POST /v1/{module}/providers/jobs/:jobId/check-out` com body `{ "code": "..." }`.
- Módulos suportados hoje: `bars-restaurants` e `home-services` (com alias legado `freela-em-casa`).
- `providerId` é resolvido exclusivamente via JWT (não entra em path/body).

**Rotas legadas ainda suportadas (checkout):**

- `POST /v1/{module}/providers/jobs/check-outs/validate` → **LEGADO (suportado)**.
  - Status: **Deprecated** para novas integrações.
  - Motivo: fluxo canônico consolidado em `POST .../providers/jobs/:jobId/check-out`.
- `POST /v1/{module}/contractors/jobs/check-outs` → **LEGADO (suportado)** para finalização pelo contractor após validação.
- `POST /v1/{module}/contractors/jobs/check-outs/code` e `GET /v1/{module}/contractors/jobs/:jobId/check-outs/status` → mantidos para compatibilidade de fluxo com apps legados.

> Não há data de remoção publicada para as rotas legadas acima neste momento.

**Request — POST /v1/bars-restaurants/providers/jobs/:jobId/check-out**

```json
{
  "code": "XYZ789"
}
```

> `providerId` é obtido do JWT. Semântica de erro esperada: `200` (sucesso), `422` (código inválido), `403` (sem permissão), `409` (estado inválido/já finalizado).

**Semântica de erro efetiva (implementação atual):**

- `200` sucesso na validação + finalização.
- `422 Unprocessable Entity` quando o código é inválido (`Invalid check-out code.`).
- `409 Conflict` quando o job não pode ser finalizado no estado atual:
  - `Check-out code must be validated before finalization.`
  - `Job is already finalized.`
  - `Invalid job state for check-out.`
- `404 Not Found` quando job/check-out não pertence ao usuário autenticado ou não existe (`Check-out not found.` / `Job not found.`).

> Observação: embora o contrato histórico cite `403` para permissão, o backend atualmente aplica `404` em cenários de ownership/escopo para evitar enumeração de recursos nesse fluxo.

**Request — POST /v1/bars-restaurants/providers/jobs/check-outs/validate (legado suportado)**

```json
{
  "vacancyId": "vacancy-uuid",
  "checkOutId": "checkout-uuid",
  "code": "XYZ789"
}
```

> `vacancyId` é aditivo e opcional para compatibilidade; quando enviado, deve corresponder ao `vacancyId` do job do `checkOutId`.

**Regras de negócio após validação bem-sucedida:**

- O código é validado com ownership de provider (provider autenticado deve estar vinculado ao job).
- O check-out é marcado como `validated` (`validatedAt` preenchido).
- A vaga (`vacancyId`) vinculada ao job é atualizada para `status = CLOSED` quando ainda estiver aberta.
- Atualização é idempotente para vaga já `CLOSED` (sem erro e sem alteração adicional de contrato).

**Estados canônicos de checkout (`status`):**

- `pending`: código gerado e aguardando validação do provider.
- `validated`: código validado pelo provider.
- `checked_out`: finalização concluída pelo contractor.

**Regras de ownership/perfil (checkout):**

- Apenas contractor dono do job pode gerar código (`POST .../contractors/jobs/check-outs/code`).
- Apenas provider vinculado ao job pode validar código (`POST .../providers/jobs/check-outs/validate`).
- Apenas contractor dono do job pode finalizar (`POST .../contractors/jobs/check-outs`).
- Finalização sem validação prévia retorna `409` (`Check-out code must be validated before finalization.`).
- Polling do contractor (`GET .../contractors/jobs/:jobId/check-outs/status`) retorna o estado agregado mais recente do job.
- Polling do provider (`GET .../providers/:providerId/jobs/:jobId/check-outs`) exige que `:providerId` pertença ao provider autenticado e ao job.

**Semântica de erro relevante (check-in/check-out):**

- Check-in:
  - `403 Forbidden` quando provider/contractor não corresponde ao ator esperado (`Only assigned provider...` / `Only contractor...`).
  - `401 Unauthorized` para código inválido na validação (`Invalid check-in code.`).
  - `404 Not Found` para job/check-in inexistente.
- Check-out:
  - `422` código inválido na validação.
  - `409` violações de estado de finalização.
  - `404` não encontrado/ownership inválido.

#### Feedbacks

| Método | Path                                                         | Auth | Descrição                         |
| ------ | ------------------------------------------------------------ | ---- | --------------------------------- |
| `POST` | `/v1/bars-restaurants/providers/jobs/feedbacks`              | ✅   | Feedback do prestador sobre job   |
| `GET`  | `/v1/bars-restaurants/providers/:id/jobs/:jobId/feedbacks`   | ✅   | Feedback do prestador por job     |
| `GET`  | `/v1/bars-restaurants/providers/:id/jobs/feedbacks`          | ✅   | Todos os feedbacks do prestador   |
| `POST` | `/v1/bars-restaurants/contractors/jobs/feedbacks`            | ✅   | Feedback do contratante sobre job |
| `GET`  | `/v1/bars-restaurants/contractors/:id/jobs/:jobId/feedbacks` | ✅   | Feedback do contratante por job   |
| `GET`  | `/v1/bars-restaurants/contractors/:id/jobs/feedbacks`        | ✅   | Todos os feedbacks do contratante |

**Regra de unicidade de feedback (CONTRACT-FIX-006):**

- O backend bloqueia feedback duplicado por combinação `(job_id, author_id, role)`.
- Em tentativa duplicada, retorna `409 Conflict` com mensagem exata:

```json
{
  "error": {
    "message": "Feedback already submitted for this job."
  }
}
```

---

### Module: Home Services

> Estrutura idêntica ao módulo Bars & Restaurants.
> Prefixo canônico: `/v1/home-services/` em todos os paths.
> Compatibilidade temporária: `/v1/freela-em-casa/**` continua aceito como alias legado.
> Regras de negócio e dados de domínio distintos.
>
> Endpoints de jobs incluem:
>
> - `GET /v1/home-services/jobs/by-vacancy/:vacancyId`
> - `GET /v1/freela-em-casa/jobs/by-vacancy/:vacancyId` (alias legado)
> - `GET /v1/home-services/jobs/:id` e `GET /v1/freela-em-casa/jobs/:id` com campo aditivo `hasGivenFeedback`
> - `GET /v1/home-services/jobs/:jobId/feedback-status` (alias: `/v1/freela-em-casa/jobs/:jobId/feedback-status`)
> - `POST /v1/home-services/providers/jobs/:jobId/check-out` (canônico temporário)
> - `POST /v1/home-services/providers/jobs/:jobId/check-out` (canônico)
> - `POST /v1/freela-em-casa/providers/jobs/:jobId/check-out` (alias legado)
> - `POST /v1/home-services/contractors/jobs/check-ins/code` (alias: `POST /v1/freela-em-casa/contractors/jobs/check-ins/code`)
> - `GET /v1/home-services/contractors/jobs/:jobId/check-ins/status` (alias: `GET /v1/freela-em-casa/contractors/jobs/:jobId/check-ins/status`)
> - `POST /v1/home-services/providers/jobs/check-ins/validate` (alias: `POST /v1/freela-em-casa/providers/jobs/check-ins/validate`)
> - `GET /v1/home-services/providers/jobs/check-ins/:providerId/jobs/:jobId` (alias: `GET /v1/freela-em-casa/providers/jobs/check-ins/:providerId/jobs/:jobId`)
>
> **Check-out com código (espelhado do módulo Bars & Restaurants):**
>
> - `POST /v1/home-services/contractors/jobs/check-outs/code`
> - `POST /v1/home-services/providers/jobs/check-outs/validate`
> - `POST /v1/home-services/contractors/jobs/check-outs`
> - `GET /v1/home-services/contractors/jobs/:jobId/check-outs/status`
> - `GET /v1/home-services/providers/:providerId/jobs/:jobId/check-outs`
>
> Alias legado `freela-em-casa` permanece aceito para os mesmos paths.
>
> ⚠️ **ADR-012:** Os mesmos campos opcionais `providerGlobalId` definidos nos contratos do módulo Bars & Restaurants aplicam-se igualmente a este módulo — nos responses de `POST /v1/home-services/providers`, `GET /v1/home-services/providers/:id`, `POST /v1/home-services/candidacies` e `GET /v1/home-services/candidacies/:id`.
>
> **Vacancies — campos aditivos de contractor (sem breaking):**
>
> - `GET /v1/home-services/vacancies` e `GET /v1/home-services/vacancies/:id` retornam:
>   - `contractorId` (mantido)
>   - `contractorName` (novo, `string | null`)
>   - `contractorCompanyName` (novo, `string | null`)
> - Alias legado `GET /v1/freela-em-casa/vacancies` e `GET /v1/freela-em-casa/vacancies/:id` seguem o mesmo contrato aditivo.
> - Para usuário autenticado com perfil freelancer/provider em `home-services`, o `GET /v1/home-services/vacancies` aplica filtro server-side de relevância:
>   - retorna apenas vagas cujo `serviceType` exista em `provider.services`;
>   - retorna apenas vagas cujo intervalo (`startTime`-`endTime`) esteja contido na disponibilidade ativa (`provider.availability`) do dia da semana correspondente.
>
> ⚠️ **Compatibilidade (LEGADO/DEPRECADO para novas integrações):** não usar `GET /v1/home-services/providers/:id` nem `GET /v1/freela-em-casa/providers/:id` como contrato principal.
> Para leitura canônica global, usar `GET /v1/users/providers/me` (próprio) e `GET /v1/users/providers/:id` (consulta pública sanitizada).

**Candidacy duplicate conflict semantics (freela-em-casa):**

- `POST /v1/freela-em-casa/candidacies` returns `409` with semantic payload when the authenticated freelancer already applied to the same vacancy:

```json
{
  "error": {
    "code": "CANDIDACY_ALREADY_EXISTS",
    "message": "You have already applied to this vacancy."
  }
}
```

> Regra freelancer espelhada (freela-em-casa):
>
> - `GET /v1/freela-em-casa/providers/:id/future-jobs` retorna somente itens com pagamento confirmado (`payments.status = COMPLETED`).
> - `GET /v1/freela-em-casa/candidacies/providers` expõe `data[].freelancerStatus` com a mesma semântica (`pendente` | `agendado` | `null`).
> - Contrato canônico de jobs/candidacies aplicado também em `freela-em-casa`:
>   - `POST /v1/freela-em-casa/jobs` com `{ vacancyId }` (idempotente)
>   - `GET /v1/freela-em-casa/jobs/by-vacancy/:vacancyId`
>   - `GET /v1/freela-em-casa/jobs/:id/check-in-status` (polling contractor — alias legado)
>   - `GET /v1/home-services/jobs/:id/check-in-status` (polling contractor — canônico)
>   - `GET /v1/freela-em-casa/candidacies/vacancies/:vacancyId` e `GET /v1/freela-em-casa/candidacies/:id` com `jobId: string | null`

**Regra de autorização equivalente (freela-em-casa):**

- `GET /v1/freela-em-casa/contractors/:id/vacancies` e `GET /v1/freela-em-casa/vacancies/contractors/:id` retornam dados somente para o contractor do usuário autenticado.
- Para acesso cruzado entre contratantes, a API retorna `404 Contractor not found.`.
- Se o contractor autenticado não possuir vagas, a API retorna `200` com `data: []` (lista vazia, sem erro).

**Vacancies pricing behavior:**

- `POST /v1/freela-em-casa/vacancies` also computes pricing server-side from `docs/valor/valor.md`.
- `payment` is not accepted in payload for vacancy create/update in this module.
- `cityId` is optional and can be omitted when city is resolved externally via CEP.
- When provided, `cityId` accepts free-text city identifiers (no internal city UUID requirement).
- Same mandatory validations apply: minimum journey, vacancy name, hourly rate, total, retention fee, freelancer net.
- Vacancy responses (create/update/list/get) expose flat calculated fields for frontend rendering:
  - `minimumJourneyHours` (number)
  - `hourlyRateInCents` (number)
  - `totalAmountInCents` (number)
  - `retentionFeeInCents` (number)
  - `freelancerNetAmountInCents` (number)

**Bars & Restaurants vacancies responses (create/update/list/get) expose the same flat calculated fields:**

- `minimumJourneyHours` (number)
- `hourlyRateInCents` (number)
- `totalAmountInCents` (number)
- `retentionFeeInCents` (number)
- `freelancerNetAmountInCents` (number)

**Geocoding automático (contractors/providers):**

- Para `freela-em-casa` contractors/providers, payloads aceitam `cep`, `street`, `neighborhood`, `city`, `uf`, `number`, `latitude`, `longitude`.
- Precedência: coordenadas explícitas do payload vencem o geocoding automático.
- Se coordenadas não vierem, backend tenta Nominatim; em falha externa, cadastro segue sem quebrar e sem coordenadas.

**Upload de imagem (cadastro):**

- `POST /v1/freela-em-casa/contractors` não aceita upload de imagem no cadastro.
- `POST /v1/freela-em-casa/providers` aceita `multipart/form-data` com `file`; o backend faz upload para S3 e persiste a URL resultante em `avatarUrl`.

**Providers (payload externo):**

- Endpoints `POST/PUT/GET /v1/freela-em-casa/providers` expõem `services` (string[]) e `availability` (object[] JSON) como campos opcionais.
- Internamente, persistência usa coluna `specialties` no banco e é mapeada para `services` no contrato externo da API.

#### POST /v1/freela-em-casa/contractors

> **CONTRACT-FIX-001 — 2026-04-06**
> O DTO já aceitava `cep`, `street`, `neighborhood`, `city`, `uf` e `number` desde a implementação inicial.
> O contrato estava desatualizado (não documentava esses campos) — esta seção corrige e formaliza o shape completo.

**Auth:** Bearer JWT (user)
**Content-Type:** application/json

**Request (todos os campos opcionais):**

```json
{
  "name": "João Silva",
  "document": "12345678900",
    "cityId": "city-uuid",
    "complement": "Apto 12",
    "cep": "01311000",
  "street": "Avenida Paulista",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "uf": "SP",
  "number": "123",
  "address": "Avenida Paulista, 123 — Bela Vista, São Paulo-SP",
  "latitude": -23.55052,
  "longitude": -46.633308
}
```

**Validation rules:**

| Campo | Tipo | Obrig. | Regras |
|-------|------|--------|--------|
| `name` | string | ❌ | min 2, max 120 chars |
| `document` | string | ❌ | sem validação de dígitos no DTO — apenas string |
| `cityId` | string | ❌ | free-text (não é UUID interno obrigatório) |
| `cep` | string | ❌ | normalizado para 8 dígitos (`\D` removidos) — regex `/^\d{8}$/` |
| `street` | string | ❌ | trimmed, min 2, max 120 |
| `neighborhood` | string | ❌ | trimmed, min 2, max 120 |
| `city` | string | ❌ | trimmed, min 2, max 120 |
| `uf` | string | ❌ | trimmed + uppercase, exatamente 2 chars |
| `number` | string | ❌ | trimmed, min 1, max 20 |
| `complement` | string | ❌ | trimmed, min 1, max 120 |
| `address` | string | ❌ | string livre (endereço concatenado — campo legado) |
| `latitude` | number | ❌ | latitude válida (`@IsLatitude`) |
| `longitude` | number | ❌ | longitude válida (`@IsLongitude`) |

> **Campos mutuamente complementares:** `address` (string livre legada) e os campos decompostos (`cep`, `street`, `neighborhood`, `city`, `uf`, `number`) são aceitos simultaneamente. O geocoding usa os campos decompostos quando disponíveis.

**Geocoding behavior:**

- Se `latitude` + `longitude` **não** vierem no payload, o backend tenta geocodificação automática via Nominatim usando os campos de endereço disponíveis.
- Se o geocoding falhar (serviço externo), a criação **não é interrompida** — coordenadas ficam como `null`.
- Coordenadas explícitas no payload sempre têm precedência sobre o geocoding automático.

**Business rule:**

- Um usuário só pode ter um contractor no módulo freela-em-casa — segundo cadastro retorna `409 Conflict`.

**Response 201:**

```json
{
  "data": {
    "id": "contractor-uuid",
    "userId": "user-uuid",
    "name": "João Silva",
    "document": "12345678900",
    "address": "Avenida Paulista, 123 — Bela Vista, São Paulo-SP",
    "cep": "01311000",
    "street": "Avenida Paulista",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "uf": "SP",
    "number": "123",
    "complement": "Apto 12",
    "latitude": -23.55052,
    "longitude": -46.633308,
    "cityId": "city-uuid",
    "avatarUrl": null,
    "isActive": true,
    "createdAt": "2026-04-06T12:00:00.000Z",
    "updatedAt": "2026-04-06T12:00:00.000Z"
  }
}
```

**Errors:**

- `400` Payload inválido (campo com formato errado — ex: `uf` com 3 chars, `cep` não numérico)
- `401` Não autenticado
- `409` Contractor already exists (userId já tem contractor neste módulo)
- `500` Internal server error

#### PUT /v1/freela-em-casa/contractors

**Auth:** Bearer JWT (user)
**Content-Type:** multipart/form-data

**Request (todos os campos opcionais — patch semântico):**

- `name` (string, optional)
- `document` (string, optional)
- `cityId` (string, optional)
- `cep` (string, optional) — normalizado para 8 dígitos
- `street` (string, optional)
- `neighborhood` (string, optional)
- `city` (string, optional)
- `uf` (string, optional) — normalizado para uppercase
- `number` (string, optional)
- `complement` (string, optional)
- `address` (string, optional) — campo livre legado
- `latitude` (number, optional)
- `longitude` (number, optional)
- `avatarUrl` (string, optional) — URL de avatar já hospedada
- `file` (file, optional) — imagem de avatar (JPG/PNG/GIF, max 5MB); quando enviado, faz upload para S3 e sobrescreve `avatarUrl`

**Patch semantics:**

- Apenas campos **presentes** no payload são atualizados. Campos ausentes mantêm o valor atual.
- Geocoding é re-tentado se: nenhuma coordenada explícita foi enviada E o contractor ainda não tem coordenadas E há ao menos um campo de endereço novo ou existente.

**Response 200:**

```json
{
  "data": {
    "id": "contractor-uuid",
    "userId": "user-uuid",
    "name": "João Silva",
    "document": "12345678900",
    "address": "Avenida Paulista, 123",
    "cep": "01311000",
    "street": "Avenida Paulista",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "uf": "SP",
    "number": "123",
    "complement": "Apto 12",
    "latitude": -23.55052,
    "longitude": -46.633308,
    "cityId": "city-uuid",
    "avatarUrl": "https://freela-uploads.s3.us-east-1.amazonaws.com/avatars/avatar.jpg",
    "isActive": true,
    "createdAt": "2026-04-06T12:00:00.000Z",
    "updatedAt": "2026-04-06T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 404, 500

#### POST /v1/freela-em-casa/providers

**Auth:** Bearer JWT (user)

**Contrato aceito (compatível com front atual + legado):**

```json
{
  "cpf": "949.087.370-53",
  "birthDate": "02/12/1992",
  "sex": "masculino",
  "hasPcd": false,
  "address": {
    "cep": "01311-000",
    "street": "Avenida Paulista",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "uf": "SP",
    "number": "123"
  },
  "pixKeyType": "CPF",
  "pixKey": "94908737053",
  "emergencyContact": {
    "name": "Maria",
    "phone": "+5511999999999",
    "relationship": "mãe"
  },
  "services": ["Faxina"],
  "availability": [
    {
      "key": "mon",
      "label": "Segunda",
      "active": true,
      "start": "08:00",
      "end": "18:00"
    }
  ]
}
```

**Backward compatibility mantida:**

- Campos legados de endereço em formato flat continuam aceitos no body (`cep`, `street`, `neighborhood`, `city`, `uf`, `number`, `latitude`, `longitude`).
- `birthdate` (`yyyy-mm-dd`) também continua aceito além de `birthDate` (`dd/MM/yyyy`).
- Se `pixKeyType` e `pixKey` forem enviados no cadastro, a API cria a chave Pix default do provider automaticamente.

**Regras de normalização/validação:**

- `cpf` aceita máscara, mas é normalizado para 11 dígitos antes da persistência; duplicidade retorna `409`.
- `sex` aceito: `masculino`, `feminino`, `outro`.
- `address.uf` é normalizado para uppercase (`SP`, `RJ`, etc.).
- Compatibilidade adicional de payload no `address` (alias):
  - `address.state` é aceito como alias de `address.uf` (normalizado para uppercase).
  - `address.complement` é aceito e ignorado no persist (não causa erro de validação).
- `birthDate`/`birthdate` é persistido como data (sem horário).

**Mapeamento de persistência principal:**

- provider: `cpf`, `birthdate`, `sex`, `hasPcd`, `emergencyContact`, endereço e metadados.
- pix key: `pixKeyType` + `pixKey` em `pix_keys` (`isDefault=true`) quando enviados.

**Response 201:**

```json
{
  "data": {
    "id": "provider-uuid",
    "userId": "user-uuid",
    "providerGlobalId": "provider-global-uuid",
    "isActive": true,
    "createdAt": "2026-04-03T12:00:00.000Z",
    "updatedAt": "2026-04-03T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 409, 422, 500

Grupos de endpoints: **Admin · Contractors · Providers · Vacancies · Candidacies · Jobs · Check-in/Check-out · Feedbacks**

#### Vacancies (Home Services)

| Método   | Path                                                | Auth | Descrição            |
| --------- | --------------------------------------------------- | ---- | -------------------- |
| `POST`   | `/v1/home-services/vacancies`                    | ✅   | Cria vaga           |
| `DELETE` | `/v1/home-services/vacancies/:id`                | ✅   | Remove vaga          |
| `GET`    | `/v1/home-services/vacancies/:id`                | ✅   | Busca vaga por ID    |
| `GET`    | `/v1/home-services/vacancies/contractors/:id`    | ✅   | Vagas por contractor |
| `PATCH`  | `/v1/home-services/vacancies/:id/jobs/schedule`  | ✅   | Agenda job da vaga   |
| `PATCH`  | `/v1/home-services/vacancies/:id/jobs/terminate` | ✅   | Encerra job da vaga  |
| `DELETE` | `/v1/home-services/vacancies/:id/jobs`           | ✅   | Remove job da vaga   |
| `POST`   | `/v1/home-services/vacancies/:id/cancel`     | ✅   | Cancela candidatura de freelancer (reembolso conforme regra de 2h) |

#### POST /v1/home-services/vacancies/:id/cancel

**Auth:** Bearer JWT (user - contractor)

**Request:**

```json
{
  "providerId": "provider-uuid"
}
```

**Regras de Negócio:**

1. **Verificação de ownership (BR-SEC07):** Apenas o contrator da vaga pode cancelar
2. **Check-in:** Se o freelancer já fez check-in → erro `422 Freelancer já iniciou o serviço`
3. **Pagamento:** Espera-se que o pagamento esteja `COMPLETED` (job deve existir)
4. **Cálculo de tempo:** `startTime - now()`
   - **≥ 2h antes:** Caso 1 (reembolso 100%)
   - **< 2h antes:** Caso 2 (reembolso 50% + split)
5. **Split do Caso 2:**
   - Contrator recebe 50% de volta
   - Plataforma fica com 10% (20% de 50%)
   - Freelancer perde 40% (não recebe o repasse pendente)

**Response 200:**

```json
{
  "data": {
    "message": "Vacancy cancelled successfully.",
    "vacancyId": "vacancy-uuid",
    "providerId": "provider-uuid",
    "status": "CANCELLED_BY_CONTRACTOR",
    "refundAmount": 10000,
    "refundType": "FULL",
    "checkInExists": false
  }
}
```

**Errors:**

- `404 Vacancy not found.` (quando não é owner ou vaga não existe)
- `404 Accepted candidacy not found for this provider.`
- `422 Freelancer já iniciou o serviço` (check-in já realizado)
- `401` Não autenticado
- `500` Erro interno

#### POST /v1/bars-restaurants/contractors/jobs/check-ins/code

**Auth:** Bearer JWT (user with contractor profile)

**Request:**

```json
{
  "jobId": "job-uuid"
}
```

**Response 201:**

```json
{
  "data": {
    "id": "checkin-uuid",
    "jobId": "job-uuid",
    "code": "ABC123",
    "validatedAt": null,
    "checkedInAt": null,
    "createdAt": "2026-04-09T12:00:00.000Z"
  }
}
```

**Errors:** 400, 401, 403, 404, 422, 500

#### GET /v1/bars-restaurants/contractors/jobs/:jobId/check-ins/status

**Auth:** Bearer JWT (user with contractor profile)

**Response 200:**

```json
{
  "data": {
    "jobId": "job-uuid",
    "hasCodeGenerated": true,
    "isValidated": true,
    "isCheckedIn": false,
    "checkInId": "checkin-uuid",
    "validatedAt": "2026-04-09T12:10:00.000Z",
    "checkedInAt": null,
    "updatedAt": "2026-04-09T12:10:00.000Z"
  }
}
```

**Response 200 (ainda sem código gerado):**

```json
{
  "data": {
    "jobId": "job-uuid",
    "hasCodeGenerated": false,
    "isValidated": false,
    "isCheckedIn": false,
    "checkInId": null,
    "validatedAt": null,
    "checkedInAt": null,
    "updatedAt": null
  }
}
```

**Errors:** 401, 403, 500
