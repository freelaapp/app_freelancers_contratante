---
name: ADR-001 Folder Structure
description: Estrutura de pastas presentation/domain/data adotada, aliases TypeScript, e regras de dependência entre camadas
type: project
---

O projeto usa Expo Router (file-based routing). A pasta `app/` é exclusiva do roteador e não deve conter lógica de negócio ou componentes reutilizáveis. Todo código de suporte vive em `src/`, organizado em três camadas: presentation, domain e data.

## Estrutura completa (ADR-001, implementada em 2026-04-09)

```
freela-mobile/
├── app/                          # Expo Router — apenas roteamento e layouts
│   ├── _layout.tsx
│   ├── modal.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       └── explore.tsx
├── assets/                       # Imagens, fontes, ícones
├── src/
│   ├── index.ts                  # Barrel export público (opcional)
│   ├── presentation/             # UI: screens, components, hooks de UI, contexts, navigation
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── navigation/
│   │   └── contexts/
│   ├── domain/                   # Regras de negócio puras — sem dependências externas
│   │   ├── entities/             # User.ts, Auth.ts
│   │   ├── usecases/
│   │   └── repositories/        # Contratos (interfaces) — IAuthRepository.ts
│   ├── data/                     # Implementações concretas
│   │   ├── repositories/        # AuthRepository.ts (implementa IAuthRepository)
│   │   ├── services/            # auth-service.ts (chamadas HTTP)
│   │   ├── storage/             # secure-storage.ts (expo-secure-store)
│   │   └── http/                # api-client.ts (Axios + interceptors)
│   ├── constants/               # Compartilhado — theme.ts (Colors, Fonts)
│   ├── utils/                   # Funções utilitárias puras
│   └── types/                   # Tipos TypeScript globais
```

## Aliases TypeScript (tsconfig.json)

```json
"@/*"             -> "./src/*"           (fallback geral — constants, utils, types)
"@assets/*"       -> "./assets/*"        (imagens e fontes)
"@presentation/*" -> "./src/presentation/*"
"@domain/*"       -> "./src/domain/*"
"@data/*"         -> "./src/data/*"
"@utils/*"        -> "./src/utils/*"
"@types/*"        -> "./src/types/*"
```

## Regras de dependência entre camadas (SOLID — princípio D)

- domain NAO importa de data nem de presentation
- data importa de domain (implementa contratos)
- presentation importa de domain (entidades/interfaces) e instancia data via contexto
- app/ (Expo Router) importa de presentation e de constants

## Arquivos-chave

- `src/data/http/api-client.ts` — Axios com EXPO_PUBLIC_API_URL, interceptor JWT Bearer e refresh automático com fila
- `src/data/storage/secure-storage.ts` — expo-secure-store com chaves tipadas
- `src/data/services/auth-service.ts` — chamadas HTTP de autenticação
- `src/data/repositories/AuthRepository.ts` — implementa IAuthRepository
- `src/domain/entities/User.ts` — entidade User
- `src/domain/entities/Auth.ts` — AuthTokens, AuthSession, AuthCredentials
- `src/domain/repositories/IAuthRepository.ts` — contrato de autenticação
- `src/presentation/contexts/AuthContext.tsx` — AuthProvider com signIn/signOut/session/user/isLoading/error

## Bibliotecas aprovadas instaladas

- axios (^1.15.0)
- expo-secure-store (incluso no Expo SDK)
- prettier (^3.8.1)
- eslint-config-prettier + eslint-plugin-prettier

## Scripts npm

- `npm run lint` / `lint:fix` — ESLint via expo lint
- `npm run format` / `format:check` — Prettier

## Variáveis de ambiente (.env.example)

- EXPO_PUBLIC_API_URL — URL base da API (sem barra final)
- EXPO_PUBLIC_ENV — development | staging | production

**Why:** Separar em presentation/domain/data aplica Clean Architecture e garante que domain seja totalmente isolado, facilitando testes e substituição de implementações.
**How to apply:** Ao criar qualquer novo recurso, identificar a qual camada pertence antes de criar o arquivo. Nunca colocar lógica HTTP ou de storage em domain ou presentation diretamente.
