# Changelog

All notable changes to this project will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
following [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed
- `types/vagas.ts`: expande `VagaStatus` para incluir `"preenchida"` e `"em_andamento"` — os componentes `VagaCard` e `BookingCard` já aceitavam esses valores mas o tipo os excluía, causando inconsistência de tipagem.
- `utils/vaga-status-map.ts`: adiciona `mapApiStatusExtended()` para derivar os quatro estados de UI (`aberta`, `preenchida`, `em_andamento`, `concluida`) a partir de `vacancy.status` + campos auxiliares opcionais (`jobStatus`, `hasAcceptedCandidacy`). `mapApiStatus()` preservado intacto pois continua correto para listagens que retornam apenas `vacancy.status`.
- `app/(home)/vagas.tsx`: corrige `STATUS_BY_FILTER` cujas chaves (`abertas`, `preenchidas`, `em_andamento`, `concluidas`) não correspondiam aos IDs definidos em `VAGA_FILTERS` (`confirmados`, `aguardando`, `finalizados`) — causava que os filtros "Confirmados", "Aguardando" e "Finalizados" sempre retornassem lista vazia.
- `financeiro.tsx`: corrige `mapVagaToPaymentStatus` que usava `mapApiStatus(vaga.status) === "concluida"` — lógica incorreta que marcava vagas canceladas como "Pago" e vagas ativas/em andamento como "Pendente". Substituído por `PAYMENT_CONFIRMED_STATUSES` (Set explícito com os status que indicam pagamento confirmado conforme contrato: `active`, `in_progress`, `started`, `checking_in`, `checking_out`, `transfer_pending`, `finished`, `completed`, `done`, `closed`).
- Remove import morto de `mapApiStatus` em `financeiro.tsx`.

### Added
- `src/__tests__/utils/vaga-status-map.test.ts`: 26 novos testes cobrindo `mapApiStatusExtended` — precedência de `vacancy.status` fechado, derivação de `em_andamento` via `jobStatus`, derivação de `preenchida` via `jobStatus` ou `hasAcceptedCandidacy`, fallback `aberta` e `jobStatus` desconhecido.

### Added
- `src/__tests__/screens/financeiro.test.tsx`: 13 testes cobrindo mapeamento correto de PaymentStatus para todos os status relevantes (OPEN, payment_pending, accepted, cancelled → Pendente; active, in_progress, started, finished, completed, transfer_pending → Pago; mix de vagas; lista vazia).

## [0.2.0] - 2026-04-29
### Added
- AuthContext with AuthProvider and useAuth hook (context/auth-context.tsx)
- Root layout rewritten with auth-gated redirect logic and ActivityIndicator loading state
- Route group (auth): Stack navigator + login and register screens
- Route group (home): Tab navigator (Início, Explorar, Perfil) with Ionicons
- Profile screen shows authenticated user name and signOut button

### Removed
- app/index.tsx placeholder screen (routing now handled via Redirect in root layout)

## [0.1.0] - 2026-04-29
### Added
- Initial Expo project setup with expo-router
