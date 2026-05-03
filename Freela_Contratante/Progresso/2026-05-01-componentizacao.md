---
title: "2026-05-01 — Componentização completa"
tags:
  - progresso
  - refactor
date: 2026-05-01
pr: "feat/home-screen → main"
---

# 2026-05-01 — Componentização completa

## O que foi feito

Três rodadas de auditoria com agent dev para identificar e extrair todos os padrões repetidos do projeto.

### Rodada 1 — Átomos base
- `AvatarInitials`, `StarRating`, `Divider`, `CardContainer`
- `cardShadow`, `cardShadowStrong` exportados do `theme.ts`

### Rodada 2 — Moléculas e padrões de tela
- `StatusBadge` (com `statusColors` no theme)
- `CardHeader` (7 ocorrências)
- `BottomActionBar` (com `useSafeAreaInsets` encapsulado)
- `FilterChipBar`
- `CenteredModal`
- `PageHeader` ganhou prop `inline`
- `CodeModal` extraído internamente em `vaga/[id].tsx`

### Rodada 3 — Correções finais
- `AppSplash` e `FreelancerProfileSheet` adicionados ao barrel `index.ts`
- Badge overlay do header da vaga documentado como intencional
- Shadow do `BookingCard` normalizado para `cardShadowStrong`
- Emojis `📅 🕐` do `VagaCard` substituídos por `<Ionicons>`
- `Divider` ganhou prop `orientation="vertical"`
- Divisores verticais em `freelancer-profile-sheet` e `vaga/[id]` substituídos
- `tabShadow` exportado do theme, usado em `notificacoes.tsx`

## Resultado

- 23 arquivos alterados
- 9 novos componentes criados
- ~650 linhas adicionadas, ~665 removidas (net negativo)
- Zero erros TypeScript

## Próximo passo

→ [[Projeto/Proximos-Passos|Setup de testes (jest + testing-library + msw)]]
