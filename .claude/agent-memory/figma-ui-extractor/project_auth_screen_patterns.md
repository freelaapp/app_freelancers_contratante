---
name: Auth Screen Layout Pattern
description: The two-zone layout pattern used across all auth screens (amber header + white card with rounded top corners)
type: project
---

## Standard auth screen structure

```
KeyboardAvoidingView (flex:1, bg: #F5A623)
  AuthHeader (amber zone — logo, title, subtitle, decorative circles)
  ScrollView (white card — flex:1, borderTopRadius: 32, bg: #FFFFFF)
    [form content]
LoadingOverlay (portal-like, outside ScrollView)
```

## Card content layout
- paddingHorizontal: 24dp
- paddingTop: 28dp
- paddingBottom: 24dp
- gap: 8dp between all children
- alignItems: 'flex-start'

## Form pattern (RHF + Zod)
- Schema at `src/presentation/screens/auth/<name>Schema.ts`
- useForm with zodResolver, mode: 'onChange'
- Controller wrapping each InputField
- Submit button disabled when isSubmitting || !isValid
- Loading state from isSubmitting (never useState for this)
- Global auth errors displayed from useAuth() context as error banner

## Navigation
- Login → Register: `/(auth)/register`
- Login → Forgot password: `/(auth)/forgot-password` (not yet implemented)
- Auth success → App: handled by AuthContext

**Why:** Consistency across all auth screens and alignment with Figma design system.
**How to apply:** New auth screens should follow this exact structure. Do not deviate without designer sign-off.
