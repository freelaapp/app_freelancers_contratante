# Social Auth + Push Notifications — Especificação para o Backend

> **App:** Freela Contratante  
> **Data:** 2026-05-03  
> **Contexto:** O app mobile (React Native + Expo) está implementando login social com Google e Apple, e notificações push via Expo. Este documento descreve o que o backend precisa implementar ou adaptar.

---

## Resumo dos gaps

| Item | Status atual | Ação necessária |
|---|---|---|
| `POST /v1/users/google/connect` | Documentado no contrato | Confirmar payload aceito + implementar lógica de upsert |
| `POST /v1/users/apple/connect` | **Não existe** | Criar endpoint com validação do `identityToken` |
| `POST /v1/users/notification-subscriptions` | Existe com estrutura Web Push | Adaptar para aceitar `ExponentPushToken` |
| Firebase Project | Não configurado | Criar projeto Firebase e fornecer `google-services.json` |

---

## 1. Google Login

### Endpoint existente — verificar e implementar

```
POST /v1/users/google/connect
Authorization: não requerida
```

**Payload que o frontend enviará:**

```json
{
  "googleId": "118292838472938472983",
  "email": "usuario@gmail.com",
  "name": "João Silva"
}
```

O `googleId` e demais campos são extraídos pelo frontend via Google UserInfo API usando o `accessToken` retornado pelo fluxo OAuth. O frontend **não** envia o `idToken` do Google — envia os dados já resolvidos.

> Se o backend preferir validar o `idToken` diretamente (mais seguro), informar ao time de mobile para ajustar o fluxo de envio.

**Lógica de negócio esperada:**

```
SE googleId já existe no banco
  → retornar tokens do usuário existente

SE email existe mas sem googleId
  → vincular googleId à conta existente
  → retornar tokens

SE nenhum dos dois existe
  → criar novo usuário com emailConfirmed = true (Google já validou o e-mail)
  → disparar fluxo de onboarding
  → retornar tokens
```

**Response esperado (igual ao login convencional):**

```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "usuario@gmail.com",
      "emailConfirmed": true,
      "userType": "contractor"
    },
    "onboarding": {
      "isPending": false,
      "nextStep": null
    },
    "context": {
      "modules": ["bars-restaurants"],
      "profilesByModule": {
        "bars-restaurants": {
          "contractorId": "contractor-uuid",
          "role": "contractor"
        }
      }
    }
  }
}
```

**Error responses:**

| Código | Quando |
|---|---|
| `400` | Payload incompleto |
| `422` | Conta existente vinculada a outro provedor de forma conflitante |
| `500` | Erro interno |

---

## 2. Apple Login

### Endpoint novo — precisa ser criado

```
POST /v1/users/apple/connect
Authorization: não requerida
```

**Payload que o frontend enviará:**

```json
{
  "identityToken": "eyJraWQiOiJXNldjT...",
  "appleId": "001234.abc123def456.1234",
  "email": "usuario@privaterelay.appleid.com",
  "name": "João Silva"
}
```

> **Atenção crítica:** `email` e `name` chegam **apenas na primeira autenticação** do usuário. Nas seguintes eles virão como `null` ou ausentes. O backend deve persistir essas informações na primeira vez e não exigi-las nas seguintes.

### Validação obrigatória do `identityToken` (server-side)

O `identityToken` é um **JWT assinado pela Apple**. O backend **deve** validá-lo antes de confiar nos dados. Não confiar apenas no `appleId` enviado pelo cliente.

**Passos de validação:**

1. Fetch das public keys da Apple:
   ```
   GET https://appleid.apple.com/auth/keys
   ```

2. Verificar a assinatura do JWT usando a public key correspondente ao `kid` no header do token

3. Validar os claims:
   ```
   iss = "https://appleid.apple.com"
   aud = "com.freela.freela-contratante"   ← bundle ID do app iOS
   exp > agora (token não expirado)
   ```

4. Extrair o `sub` do JWT — este é o `appleId` real. Comparar com o `appleId` enviado pelo cliente como verificação adicional.

**Libs de referência:**

- Node.js: `jsonwebtoken` + `jwks-rsa`
- Python: `PyJWT` + `cryptography`
- Java: `nimbus-jose-jwt`

**Lógica de negócio esperada:**

```
SE appleId já existe no banco
  → retornar tokens do usuário existente

SE email existe mas sem appleId (e email não é null)
  → vincular appleId à conta existente
  → retornar tokens

SE nenhum dos dois existe
  → criar novo usuário
  → emailConfirmed = true (Apple já validou)
  → SE email vier null (autenticações subsequentes): criar com email temporário ou exigir completar depois
  → retornar tokens
```

**Response esperado:** mesma estrutura do `POST /v1/users/google/connect` acima.

**Error responses:**

| Código | Quando |
|---|---|
| `400` | Payload incompleto ou identityToken malformado |
| `401` | identityToken inválido (assinatura não verificada ou expirado) |
| `422` | Conflito de conta |
| `500` | Erro interno ou falha ao buscar Apple public keys |

---

## 3. Push Notifications

### Contrato atual — problema de incompatibilidade

O contrato atual documenta:

```
POST /v1/users/notification-subscriptions
{
  "endpoint": "...",
  "p256dhKey": "...",
  "authKey": "..."
}
```

Esta estrutura é do **Web Push Protocol (VAPID)** — usado em browsers. O app mobile usa **Expo Push Notifications**, que funciona com um token no formato `ExponentPushToken[xxx]`.

### Adaptação necessária

**Opção A — Expo Push API (recomendado — mais simples):**

O backend armazena o `ExponentPushToken` e usa a API do Expo para enviar notificações. O Expo encaminha automaticamente para FCM (Android) e APNs (iOS).

**Novo contrato para o endpoint de registro:**

```
POST /v1/users/notification-subscriptions
Authorization: Bearer {accessToken}
```

```json
{
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios",
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `expoPushToken` | string | Sim | Token no formato `ExponentPushToken[xxx]` |
| `platform` | `"ios"` \| `"android"` | Sim | Plataforma do dispositivo |
| `deviceId` | string | Recomendado | UUID do dispositivo para evitar duplicatas |

**Response:**

```json
{
  "data": {
    "id": "subscription-uuid",
    "expoPushToken": "ExponentPushToken[xxx]",
    "createdAt": "2026-05-03T10:00:00.000Z"
  }
}
```

**Como enviar notificações via Expo Push API:**

```bash
POST https://exp.host/--/api/v2/push/send
Content-Type: application/json
Accept: application/json
Accept-Encoding: gzip, deflate

{
  "to": "ExponentPushToken[xxxxxx]",
  "title": "Nova candidatura recebida",
  "body": "Um freelancer se candidatou para sua vaga de Garçom",
  "data": { "vagaId": "uuid", "screen": "/(home)/vagas/[id]" }
}
```

Docs completas: [docs.expo.dev/push-notifications/sending-notifications](https://docs.expo.dev/push-notifications/sending-notifications/)

**Endpoint adicional recomendado — desregistrar ao fazer logout:**

```
DELETE /v1/users/notification-subscriptions
Authorization: Bearer {accessToken}

{
  "expoPushToken": "ExponentPushToken[xxx]"
}
```

---

**Opção B — FCM/APNs direto (mais controle, mais complexidade):**

- Android: usar Firebase Admin SDK com o token nativo FCM
- iOS: usar APNs diretamente com certificados `.p8`
- O frontend enviaria o token nativo (`Notifications.getDevicePushTokenAsync()`) em vez do Expo token
- Não recomendado para MVP — requer mais configuração e manutenção

---

### Firebase — configuração necessária (para Android)

1. Acessar [console.firebase.google.com](https://console.firebase.google.com)
2. Criar projeto Firebase (ou usar existente)
3. Adicionar app Android com package name: `com.freela.contratante`
4. Baixar o arquivo `google-services.json`
5. **Enviar o `google-services.json` para o time de mobile** — ele deve ser colocado na raiz do projeto Expo antes do build

> Para iOS (APNs), o EAS Build lida automaticamente com os certificados via Apple Developer Account. Nenhum arquivo adicional é necessário do lado do backend para APNs quando usando Expo Push API.

---

## Resumo de endpoints

| Método | Endpoint | Status | Prioridade |
|---|---|---|---|
| `POST` | `/v1/users/google/connect` | Documentado, implementar | Alta |
| `POST` | `/v1/users/apple/connect` | **Criar** | Alta |
| `POST` | `/v1/users/notification-subscriptions` | Adaptar payload | Média |
| `DELETE` | `/v1/users/notification-subscriptions` | **Criar** | Baixa |

---

## Dúvidas pendentes para alinhar

1. Para o Google Login: o backend vai aceitar `googleId` direto do cliente ou prefere receber o `idToken` para validar server-side?
2. O banco de dados já tem campo para `googleId` e `appleId` na tabela de usuários?
3. Qual é a estratégia para usuários que criaram conta com e-mail e depois tentam logar com Google usando o mesmo e-mail? (auto-vincular ou pedir confirmação?)
4. Quando o backend for criar o projeto Firebase, me enviar o `google-services.json` para integrar no build do Android.
