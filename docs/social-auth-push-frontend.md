# Social Auth + Push Notifications — Guia Frontend

> **Projeto:** Freela Contratante — Expo SDK 54 / React Native 0.81.5  
> **Data:** 2026-05-03

---

## Estado atual

| Feature | Situação |
|---|---|
| Login e-mail/senha | ✅ Funcionando |
| Botão Google na tela de login | ⚠️ Visual apenas — sem lógica |
| Botão Apple na tela de login | ⚠️ Visual apenas — sem lógica |
| Push Notifications | ❌ Não implementado |

O `expo-web-browser`, `expo-linking` e `expo-dev-client` já estão instalados.  
Nenhum dos pacotes de social login ou notificações está instalado ainda.

---

## 1. Login com Google

### Instalar

```bash
npx expo install expo-auth-session expo-crypto
```

### Configurar `app.json`

O `scheme: "freelacontratante"` já está definido — nenhuma alteração necessária para `expo-auth-session`.

Se migrar para `@react-native-google-signin` no futuro (mais features), adicionar:

```json
"android": {
  "googleServicesFile": "./google-services.json"
},
"plugins": ["@react-native-google-signin/google-signin"]
```

### Google Cloud Console — 3 Client IDs necessários

1. Acessar [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID

| Tipo | Para | Campo obrigatório |
|---|---|---|
| **Web application** | `expo-auth-session` em dev | Redirect URI: `https://auth.expo.io/@freelaapp/freela-contratante` |
| **iOS** | Build de produção iOS | Bundle ID: `com.freela.freela-contratante` |
| **Android** | Build de produção Android | Package: `com.freela.contratante` + SHA-1 do keystore EAS |

Para obter o SHA-1 do keystore EAS:
```bash
eas credentials
```

### O que implementar no código

1. **`src/hooks/use-google-auth.ts`** — hook que encapsula `expo-auth-session`
2. **`authService.googleConnect()`** em `src/services/auth.service.ts` — chama `POST /v1/users/google/connect`
3. **`signInWithGoogle()`** no `AuthContext` — mesma lógica do `signIn` após receber os tokens
4. **Conectar botão** em `src/app/(auth)/login.tsx`

### Payload enviado para a API

```json
POST /v1/users/google/connect
{
  "googleId": "118292838...",
  "email": "user@gmail.com",
  "name": "João Silva"
}
```

O `googleId` vem da Google UserInfo API (`https://www.googleapis.com/userinfo/v2/me`) usando o `accessToken` retornado pelo `expo-auth-session`.

### Fluxo completo

```
Usuário toca "Entrar com Google"
  → promptAsync() abre browser nativo
  → Google autentica e redireciona para freelacontratante://
  → expo-auth-session captura o token
  → Frontend chama Google UserInfo API para obter googleId, email, name
  → Frontend chama POST /v1/users/google/connect
  → API retorna { accessToken, refreshToken, user, onboarding, context }
  → AuthContext processa igual ao login convencional
```

---

## 2. Login com Apple

> **Importante:** Apple Sign In funciona apenas em **iOS físico** (não funciona no Android nem simulador iOS sem ajustes).

### Instalar

```bash
npx expo install expo-apple-authentication
```

### Configurar `app.json`

```json
"ios": {
  "bundleIdentifier": "com.freela.freela-contratante",
  "usesAppleSignIn": true
},
"plugins": [
  "expo-apple-authentication"
]
```

### Requisitos Apple Developer

- Conta Apple Developer paga ($99/ano) — obrigatório
- Ativar capability "Sign In with Apple" no App ID `com.freela.freela-contratante` em [developer.apple.com](https://developer.apple.com) → Identifiers
- O EAS Build configura o entitlement automaticamente via `usesAppleSignIn: true`

### O que implementar no código

1. Verificar disponibilidade: `AppleAuthentication.isAvailableAsync()` — esconder botão se `false`
2. **`authService.appleConnect()`** em `auth.service.ts` — chama `POST /v1/users/apple/connect`
3. **`signInWithApple()`** no `AuthContext`
4. **Conectar botão** em `login.tsx`

### Payload enviado para a API

```json
POST /v1/users/apple/connect
{
  "identityToken": "eyJraWQ...",
  "appleId": "001234.abc...",
  "email": "user@privaterelay.appleid.com",
  "name": "João Silva"
}
```

> **Atenção:** `email` e `name` só chegam na **primeira** autenticação. Nas seguintes vêm `null`. O backend deve lidar com isso.

### Fluxo completo

```
Usuário toca "Entrar com Apple"
  → AppleAuthentication.signInAsync() abre sheet nativo da Apple
  → Apple retorna credential com identityToken + appleId + (email/name na 1ª vez)
  → Frontend chama POST /v1/users/apple/connect
  → API valida identityToken server-side com Apple Public Keys
  → API retorna { accessToken, refreshToken, user, onboarding, context }
  → AuthContext processa igual ao login convencional
```

---

## 3. Push Notifications

### Instalar

```bash
npx expo install expo-notifications expo-device
```

### Configurar `app.json`

```json
"plugins": [
  [
    "expo-notifications",
    {
      "icon": "./assets/images/notification-icon.png",
      "color": "#F5A623",
      "androidMode": "default",
      "androidCollapsedTitle": "Freela"
    }
  ]
],
"android": {
  "googleServicesFile": "./google-services.json"
}
```

> O arquivo `google-services.json` vem do Firebase — o backend precisa criar o projeto Firebase e fornecer esse arquivo.

### O que implementar no código

1. **`src/hooks/use-push-notifications.ts`** — função `registerForPushNotifications()` que:
   - Verifica se é dispositivo físico (`expo-device`)
   - Solicita permissão
   - Obtém o `ExponentPushToken[xxx]` usando o `projectId: "3d87648a-7768-4f20-8a01-a2b1cb8caa03"`
   - Configura canal Android (importante para Android 8+)

2. **`src/services/notification.service.ts`** — `registerToken(expoPushToken)` chama `POST /v1/users/notification-subscriptions`

3. **`src/context/auth-context.tsx`** — chamar `registerForPushNotifications()` após login bem-sucedido (qualquer fluxo), em background, sem bloquear o login

### Payload enviado para a API

```json
POST /v1/users/notification-subscriptions
{
  "expoPushToken": "ExponentPushToken[xxxxxx]",
  "platform": "ios",
  "deviceId": "uuid-do-dispositivo"
}
```

> O contrato atual usa estrutura Web Push (`endpoint`, `p256dhKey`, `authKey`) — o backend precisará adaptar (ver documento para o time de backend).

### Como testar push

```bash
curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/send" \
  -d '{"to": "ExponentPushToken[xxxxx]", "title": "Teste", "body": "Notificação de teste"}'
```

Ou usar a ferramenta visual: [expo.dev/notifications](https://expo.dev/notifications)

> Push token só funciona em **dispositivo físico**. No Android, emulador com Google Play Services funciona.

---

## Ordem de implementação sugerida

1. **Google Login** — já tem endpoint no backend, menor risco
2. **Push Notifications** — depende do backend adaptar o contrato e fornecer `google-services.json`
3. **Apple Login** — depende do backend criar o endpoint + necessita conta Apple Developer

---

## Dependências a instalar (resumo)

```bash
npx expo install expo-auth-session expo-crypto expo-apple-authentication expo-notifications expo-device
```
