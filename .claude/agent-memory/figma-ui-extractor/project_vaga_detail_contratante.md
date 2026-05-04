---
name: Vaga Detail Screen — Contratante View
description: Layout, components, and specs for the contratante (employer) job detail screen — extracted from screenshot 2026-04-30
type: project
---

## Screen Overview

Contratante-side job detail. Same amber header + gray bg + white cards pattern as freelancer view, but with:
- Different header badge ("Confirmado" job status, not category)
- Extra "Endereço" card
- New "Candidatos" card with accept/reject actions
- 7-step timeline (vs freelancer 6-step)
- Bottom bar: single red "Cancelar" button (no bookmark)

## Header Zone

Same specs as freelancer view (bg #F5A623, BackButton 36dp circle rgba(0,0,0,0.15), title 20dp/700 #1A1A2E, subtitle 14dp/400 rgba(26,26,46,0.7)).

Badge "Confirmado":
- Same pill style as freelancer category badge (rgba(0,0,0,0.15) bg, dark text #1A1A2E, 12dp/600)
- Represents job STATUS, not category — reuse same BadgePill component

## Endereço Card (contratante-only)

White card, borderRadius 16dp, Shadow.card, marginH 16dp, marginTop 12dp, padding 16dp.
- Label "Endereço": 14dp/700 #1A1A2E, marginBottom 8dp
- Address: 13dp/400 #687076, lineHeight 20dp

## Candidatos Card (contratante-only)

White card, borderRadius 16dp, Shadow.card, marginH 16dp, marginTop 12dp, padding 16dp.

Header row (flexDirection row, justifyContent space-between):
- "Candidatos (4)": 14dp/700 #1A1A2E
- "1 aceitos": 12dp/400 #9CA3AF

CandidatoRow (each ~56dp tall, flexDirection row, alignItems center):
- Avatar: 40x40dp circle, bg hash-generated (see palette below), initials 14dp/700 #FFFFFF
- Info col (flex:1, marginLeft 12dp):
  - Name: 14dp/600 #11181C
  - Role: 12dp/400 #9CA3AF
  - Rating: star (filled gold ~11dp) + "4.x" (12dp/600 #11181C) + "(n)" (12dp/400 #9CA3AF) + " • n jobs" (12dp/400 #9CA3AF)
- Action area (right side):
  - Pending: 3 circle buttons 32x32dp each, gap 6dp
    - Accept: bg #DCFCE7, icon checkmark #16A34A
    - Reject: bg #FEE2E2, icon close #DC2626
    - Profile: bg #F3F4F6, icon person-outline #6B7280
  - Accepted: "aceito" badge + profile button only
  - Rejected: "recusado" badge + profile button only

Row separator: 1dp #F3F4F6 (lighter than standard divider)

Status badge specs:
- aceito:   bg #DCFCE7, text #16A34A, 11dp/600, pill
- recusado: bg #FEE2E2, text #DC2626, 11dp/600, pill

Avatar color palette (hash from name):
```
['#4A9B8E','#E8A87C','#7B9EC9','#8B7355','#7B61FF','#E87C8A','#6BA583','#C9847B']
```

## Status Timeline — 7 Steps (Contratante)

Steps: Criar Vaga → Aceite da vaga → Pagamento → Inicio do Trabalho → Término do Trabalho → Repasse ao freelancer → Feedback

Same node/line visual spec as freelancer timeline. With 7 steps, node size may compress to ~10dp (vs 12dp). Label font may compress to 9dp.

## Bottom Bar — Contratante

Single full-width red button. No bookmark button.
- bg #FFFFFF, borderTop 1dp #E5E7EB
- paddingH 16dp, paddingV 12dp + safeInsets.bottom
- "Cancelar" button: flex 1, height 52dp, bg #EF4444, borderRadius 12dp, text 16dp/700 #FFFFFF

**Why:** Extracted 2026-04-30. Needed to distinguish contratante-specific UI from freelancer UI: different candidate management section, different timeline, different CTA.
**How to apply:** When implementing job detail for contratante role, use these specs. Reuse shared cards (InfoCard, DescriptionCard) and create new CandidatosCard and ContratanteTimeline components.
