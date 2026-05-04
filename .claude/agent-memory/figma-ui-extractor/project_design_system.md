---
name: Freela Design System Tokens
description: Complete color palette, typography scale, spacing, radius, shadow, and size tokens used across the Freela mobile app
type: project
---

All design tokens live in `src/constants/theme.ts`. Never hardcode values that exist here.

## Brand Colors
- Primary amber: #F5A623 (screen backgrounds, links, soft button fill base)
- Primary light: #F5E6C8 (disabled button)
- Dark: #1A1A2E (AuthHeader text on amber background)

## Text Colors
- Primary: #11181C
- Secondary: #687076
- Muted: #9CA3AF (placeholders)
- White: #FFFFFF
- Link: #F5A623
- Error: #EF4444

## Background Colors
- Screen: #F5A623 (auth screens)
- Card: #FFFFFF
- Input: #F9FAFB
- Error banner: #FEF2F2

## Border Colors
- Input default: #E5E7EB
- Social button: #DADCE0
- Input error: #EF4444

## Social
- Google icon: #EA4335
- Apple bg: #000000

## Spacing scale (base unit = 4dp)
- xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48

## Typography scale (system font — SF Pro iOS, Roboto Android)
- h1: 28/700, h2: 26/700, h3: 22/700, h4: 18/600
- body: 14/400, bodyLarge: 15/400, bodyMedium: 16/400
- label: 14/600, labelSmall: 13/500
- caption: 12/400, captionSmall: 13/400
- link: 14/600
- headerSubtitle: 15/400 lineHeight 22
- splashSubtitle: 16/400 lineHeight 24

## Border Radius
- sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, full: 999

## Shadows
- card: offset(0,2) blur 8 opacity 0.08 elevation 3
- button: offset(0,1) blur 2 opacity 0.06 elevation 1

## Component Sizes
- inputHeight: 52dp
- buttonHeight: 52dp
- socialButton (square): 60dp
- logoLogin: 96dp (default), 62dp on login screen
- logoSplash: 120dp
- inputBorderWidth: 1.5dp
- inputIconPadding: 14dp (horizontal, each side)

**Why:** Centralized design tokens prevent drift. All screens must import from @/constants/theme and never hardcode these values.
**How to apply:** Before speccing any color, size, or spacing, check theme.ts first. Prefer token names in specs over raw hex values.
