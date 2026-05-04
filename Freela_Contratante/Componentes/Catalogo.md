---
title: Catálogo de Componentes
tags:
  - componentes
  - design-system
---

# Catálogo de Componentes

Todos os componentes em `src/components/`. Exportados via barrel `index.ts`.

## Átomos

| Componente | Arquivo | Props principais | Descrição |
|---|---|---|---|
| `AvatarInitials` | `avatar-initials.tsx` | `initials`, `size?`, `backgroundColor?` | Avatar circular com iniciais |
| `StarRating` | `star-rating.tsx` | `count`, `size?`, `interactive?`, `onPress?` | Estrelas display ou interativo |
| `Divider` | `divider.tsx` | `orientation?`, `height?`, `marginHorizontal?`, `color?` | Linha divisória 1px horizontal ou vertical |
| `StatusBadge` | `status-badge.tsx` | `status`, `label` | Badge colorido por status (usa `statusColors` do theme) |

## Moléculas

| Componente | Arquivo | Props principais | Descrição |
|---|---|---|---|
| `CardContainer` | `card-container.tsx` | `children`, `style?` | Card branco com sombra padrão |
| `CardHeader` | `card-header.tsx` | `icon`, `title`, `iconColor?`, `iconSize?` | Ícone + título dentro de card |
| `FilterChipBar` | `filter-chip-bar.tsx` | `options`, `activeId`, `onSelect` | Chips de filtro horizontal scrollável |
| `PrimaryButton` | `primary-button.tsx` | `label`, `onPress`, `disabled?` | Botão primário laranja |
| `SectionHeader` | `section-header.tsx` | `title`, `icon` | Cabeçalho de seção com ícone |

## Organismos

| Componente | Arquivo | Props principais | Descrição |
|---|---|---|---|
| `BookingCard` | `booking-card.tsx` | `title`, `location`, `date`, `time`, `value`, `status`, `onPress` | Card de contratação com badge de status |
| `VagaCard` | `vaga-card.tsx` | `title`, `location`, `date`, `time`, `value`, `status`, `onPress` | Card de vaga com ícones de data/hora |
| `HomeHeader` | `home-header.tsx` | `userName`, `onNotifications` | Header da home com gradiente e stats |
| `PageHeader` | `page-header.tsx` | `title`, `inline?` | Header com botão voltar (column ou inline) |
| `BottomActionBar` | `bottom-action-bar.tsx` | `children`, `backgroundColor?`, `showTopBorder?` | Barra de ação fixada no bottom com safe area |
| `CenteredModal` | `centered-modal.tsx` | `visible`, `onClose`, `children`, `contentStyle?` | Modal centrado com backdrop |
| `FreelancerProfileSheet` | `freelancer-profile-sheet.tsx` | `visible`, `onClose`, `nome`, `iniciais`, `mediaNota?`, `jobsRealizados?`, `avaliacoes?` | Sheet de perfil do freelancer |

## Tokens do Design System (`theme.ts`)

```ts
colors        // paleta completa (primary, ink, background, surface, border…)
spacing       // escala de espaçamento (2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16…)
radii         // bordas (sm, md, lg, xl, 2xl, full)
fontSizes     // xs, sm, base, md, lg, xl, 2xl, 3xl
fontWeights   // normal, medium, semibold, bold
cardShadow    // sombra soft (elevation 2)
cardShadowStrong  // sombra forte (elevation 3)
tabShadow     // sombra de tab ativo
statusColors  // cores por status: confirmado, aguardando, cancelado, finalizado, aceito, recusado
```

## Referências

- [[Projeto/Visao-Geral|Visão Geral]]
- [[ADRs/ADR-001 Componentizacao|ADR-001 Componentização]]
