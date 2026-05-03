---
title: "ADR-001: Componentização e Design System"
tags:
  - adr
  - arquitetura
  - componentes
date: 2026-05-01
status: aceito
---

# ADR-001: Componentização e Design System

## Status

Aceito — implementado em 2026-05-01

## Contexto

O projeto acumulou padrões visuais repetidos em múltiplos arquivos: avatares, estrelas, divisores, badges de status, cards, headers e barras de ação. Isso criava inconsistências visuais e dificultava manutenção.

## Decisão

Extrair todos os padrões repetidos em componentes reutilizáveis e centralizar tokens de design em `theme.ts`. Auditoria feita com agent dev em 3 passagens.

## Componentes extraídos

| Componente | Ocorrências eliminadas |
|---|---|
| `AvatarInitials` | 3 blocos inline |
| `StarRating` | 3 implementações separadas |
| `Divider` | 5+ `<View>` de 1px |
| `CardContainer` | Card branco repetido em 5 arquivos |
| `StatusBadge` | Badge duplicado em 4 lugares |
| `CardHeader` | Ícone+título repetido 7 vezes |
| `BottomActionBar` | Barra fixada em 2 telas |
| `FilterChipBar` | Chips de filtro |
| `CenteredModal` | Modal com backdrop em 3 lugares |

## Tokens adicionados ao theme.ts

- `cardShadow`, `cardShadowStrong`, `tabShadow` — constantes de sombra
- `statusColors` — cores de status centralizadas (6 estados)

## Consequências

- **Positivo:** ~200 linhas de JSX/styles duplicados removidos; 23 arquivos alterados com net negativo de linhas
- **Positivo:** Mudança visual em um componente propaga automaticamente para todos os usos
- **Positivo:** Novos componentes prontos para testes unitários isolados
- **Neutro:** `BookingCard` e `VagaCard` foram analisados e mantidos separados — diferenças de layout são grandes demais para merge com variant props

## Referências

- [[Componentes/Catalogo|Catálogo de Componentes]]
- PR mergeado: feat/home-screen → main (2026-05-01)
