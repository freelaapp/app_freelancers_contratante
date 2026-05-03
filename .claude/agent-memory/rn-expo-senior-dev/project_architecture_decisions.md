---
name: Architecture Decisions
description: Decisões arquiteturais tomadas no projeto — padrões de código, convenções de nomenclatura, bibliotecas aprovadas
type: project
---

## Gerenciamento de estado

- Context API exclusivamente — Zustand e Redux NAO aprovados
- Cada domínio tem seu próprio contexto (ex: AuthContext)
- useMemo em todos os values de context para evitar re-renders desnecessários
- useCallback em todas as funções expostas pelo contexto

## Convenções de nomenclatura

- Componentes: PascalCase (ThemedText, HapticTab)
- Hooks: camelCase com prefixo `use` (useColorScheme, useThemeColor, useAuth)
- Services: camelCase com sufixo `Service` (authService)
- Repositórios concretos: PascalCase com sufixo `Repository` (AuthRepository)
- Interfaces de repositório: PascalCase com prefixo `I` (IAuthRepository)
- Arquivos: kebab-case (auth-service.ts, secure-storage.ts, api-client.ts)

## Padrão de tratamento de estado assíncrono

Todo hook/contexto que faz operações assíncronas expõe:
- `isLoading: boolean`
- `error: string | null`
- Resultado (success state) como dado direto no contexto/hook

## Padrão de interceptor de refresh token

api-client.ts implementa fila de requisições para refresh token:
- Variável `isRefreshing` previne múltiplos refreshes simultâneos
- `failedQueue` acumula requisições que chegaram durante o refresh
- Ao completar o refresh, `processQueue` resolve ou rejeita toda a fila
- Em caso de falha no refresh, `secureStorage.clearAll()` é chamado para limpar tokens

## Expo Router

- app/ contém apenas configuração de rotas e layouts
- Lógica de negócio NUNCA entra em app/ — fica em src/presentation/
- Screens em app/ são composições de componentes de src/presentation/components/
- typedRoutes: true e reactCompiler: true habilitados no app.json

## Armazenamento seguro

- expo-secure-store (incluso no Expo SDK) para tokens de auth
- Chaves definidas como const enum em secure-storage.ts para evitar typos
- Interface de alto nível (saveAccessToken, getRefreshToken, etc.) em vez de get/set genéricos
