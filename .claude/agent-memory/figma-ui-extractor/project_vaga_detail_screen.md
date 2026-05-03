---
name: Vaga Detail Screen Pattern
description: Layout, components, states, and token usage for the Página da Vaga (job vacancy detail) screen — updated from screenshot 2026-04-27
type: project
---

## Screen Structure

Hybrid layout — amber header zone (direct bg) + gray content zone + fixed bottom bar.

```
SafeAreaView (bg: #F5A623 at top, transitions to #F2F2F2 below header)
  [Amber header zone — NOT a card, flat amber bg]
    BackButton (circle 36dp, rgba(0,0,0,0.15) bg, dark arrow icon)
    Badge "Garçom" (pill, rgba(0,0,0,0.15) bg, dark text)
    Title (20dp/700 #1A1A2E)
    Subtitle (14dp/400 #1A1A2E ~70% opacity)
  ScrollView (flex:1, bg: #F2F2F2, paddingBottom: 100dp)
    InfoCard        (white card — 2x2 meta grid + divider + price right-aligned)
    DescriptionCard (white card — "Descrição" label + body text)
    ContractorCard  (white card — avatar initials + name + city + "Ver perfil" link)
    StatusCard      (white card — "Status da Vaga" label + horizontal 6-step timeline)
  BottomBar (absolute bottom — bookmark button + PrimaryButton CTA)
```

## Amber Header Zone Specs

- Screen bg: #F5A623 (extends from top through the subtitle)
- BackButton: 36x36dp circle, bg rgba(0,0,0,0.15), icon arrow-back/chevron-back, icon color #1A1A2E, marginTop 16dp, marginLeft 16dp
- Badge: pill shape, bg rgba(0,0,0,0.15), text 12dp/600 #1A1A2E, paddingH 10dp paddingV 4dp, borderRadius 999dp
- Title: 20dp/700 #1A1A2E, marginH 16dp, marginTop 8dp, maxLines 2
- Subtitle: 14dp/400 color ~rgba(26,26,46,0.7), marginH 16dp, marginTop 4dp
- NO white card over amber — text sits directly on amber bg in dark color

## InfoCard Spec

White card, bg #FFFFFF, borderRadius 16dp, Shadow.card, marginH 16dp, marginTop 16dp, padding 16dp.

2x2 meta grid (each cell ~50% width, flexWrap row):
- Icon: 16dp, color #F5A623 (Ionicons: calendar-outline, location-outline, briefcase-outline, time-outline)
- Label row: 11dp/400 #9CA3AF (e.g. "Data e Horário", "Local", "Função da vaga", "Duração")
- Value row: 13dp/700 #11181C (primary value, e.g. "22 Fev 2026", "São Paulo, SP", "Garçom", "6 horas")
- Sub-value (date/location only): 12dp/400 #11181C (e.g. "18:00 - 00:00", "3,2 km")
- Grid gap: ~12dp between rows

Divider: 1dp #E5E7EB, full content width, marginV 12dp

Price "R$250":
- 24dp/700 #F5A623, textAlign 'right'

## DescriptionCard Spec

White card, bg #FFFFFF, borderRadius 16dp, Shadow.card, marginH 16dp, marginTop 12dp, padding 16dp.

- "Descrição" label: 14dp/700 #1A1A2E, marginBottom 8dp
- Body text: 13dp/400 #687076, lineHeight 20dp

## ContractorCard Spec

White card, bg #FFFFFF, borderRadius 16dp, Shadow.card, marginH 16dp, marginTop 12dp, padding 16dp.

- "Contratante" label: 14dp/700 #1A1A2E, marginBottom 12dp
- Inner row: flexDirection row, alignItems center
  - Avatar: 44x44dp circle, bg #7B61FF (PURPLE — not amber), initials 16dp/700 #FFFFFF, marginRight 12dp
  - Name: 14dp/700 #11181C
  - Location: 12dp/400 #687076, gap ~2dp from name
  - "Ver perfil >" link: 13dp/600 #F5A623, alignSelf center, positioned right end of row

NOTE: Avatar background is #7B61FF (purple/violet), not the amber brand color. This appears to be contractor-specific or generated from name hash.

## StatusCard Spec

White card, bg #FFFFFF, borderRadius 16dp, Shadow.card, marginH 16dp, marginTop 12dp, marginBottom 100dp, padding 16dp.

- "Status da Vaga" label: 14dp/700 #1A1A2E, marginBottom 16dp

### Timeline — 6 STEPS (not 4)

Steps (left to right):
1. "Candidatura"
2. "Aceite da vaga"
3. "Início do Trabalho"
4. "Término do Trabalho"
5. "Pagamento"
6. "Feedback"

Row layout: [Node][Line flex:1][Node][Line flex:1][Node][Line flex:1][Node][Line flex:1][Node][Line flex:1][Node]
Labels row below (textAlign center, each label constrained to node column width, wraps to 2 lines)

Node specs:
- Active node: 12dp diameter circle, bg #F5A623, no border, subtle amber glow shadow
- Inactive node: 12dp diameter circle, bg #FFFFFF, border 1.5dp #D1D5DB
- (No checkmark icons — nodes are plain filled/outlined circles at this compact size)

Connector line:
- height 2dp, flex:1
- Completed segments: #F5A623
- Inactive segments: #E5E7EB

Label specs:
- Active label: 10dp/600 #F5A623
- Inactive label: 10dp/400 #9CA3AF
- Labels wrap to 2 lines (e.g. "Aceite da\nvaga", "Início do\nTrabalho")

## The 6 States

Type: `type VagaState = 'open' | 'applied' | 'selected' | 'working' | 'completed' | 'review'`

| State     | Button Label            | Active Timeline Step (-1 = none) |
|-----------|-------------------------|----------------------------------|
| open      | "Candidatar-se"         | -1                               |
| applied   | "Candidatura Enviada"   | 0 (Candidatura)                  |
| selected  | "Início do Trabalho"    | 1 (Aceite da vaga)               |
| working   | "Término do Trabalho"   | 2 (Início do Trabalho)           |
| completed | "Confirmar Conclusão"   | 3 (Término do Trabalho)          |
| review    | "Avaliar"               | 4 (Pagamento) or 5 (Feedback)    |

Current screenshot shows: state 'open' — CTA is "Candidatar-se", step 0 ("Candidatura") is active/amber.
NOTE: The open state appears to pre-highlight step 0 as a "pending" indicator even before application.

## Bottom Bar Spec

- position: absolute, bottom: 0
- bg: #FFFFFF
- borderTopWidth: 1dp, borderTopColor: #E5E7EB
- paddingHorizontal: 16dp, paddingVertical: 12dp + safeAreaInsets.bottom
- shadowOffset y: -2, shadowOpacity: 0.06, shadowRadius: 4
- flexDirection: 'row', gap: 12dp, alignItems: 'center'

Bookmark button:
- Size: 52x52dp
- bg: #F5E6C8 (light amber tint)
- border: 1.5dp #F5A623
- borderRadius: 12dp (Radius.md)
- icon: bookmark-outline, 22dp, color #F5A623

CTA "Candidatar-se" button:
- flex: 1, height: 52dp
- bg: #F5A623
- borderRadius: 12dp (NOT full/pill — slightly rounded rectangle)
- text: 16dp/700 #FFFFFF, textAlign center

## New Theme Token Needed

- `colors.avatar.purple: '#7B61FF'` — contractor avatar background. Consider generating from name hash for variety.

**Why:** Updated from screenshot 2026-04-27. Previous version had wrong timeline step count (4 vs 6), wrong avatar color (amber vs purple), wrong node sizes (24-28dp vs 12dp), and wrong title color (white vs dark on amber bg).
**How to apply:** Use these specs verbatim when implementing VagaStatusTimeline (6 steps), ContractorCard (purple avatar), and the header zone (no card, direct amber bg with dark text).
