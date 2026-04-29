# Architecture

## Stack
- Framework: Expo (SDK 54) + Expo Router ~6.0.23
- Navigation: expo-router (file-based routing, Stack + Tabs)
- State Management: React Context (AuthContext)
- Data Fetching: Native fetch (no external lib)
- Forms: Controlled TextInput (React Native built-in)
- Tests: none configured yet
- UI Components: react-native core + @expo/vector-icons

## Architectural Pattern
- Pattern: File-based routing with route groups (Expo Router)
- Rationale: Expo Router enforces co-location of layout and screens per group

## Folder Structure
```
app/
  _layout.tsx          — Root layout: AuthProvider + redirect logic
  (auth)/
    _layout.tsx        — Stack navigator, no header
    login.tsx
    register.tsx
  (home)/
    _layout.tsx        — Tab navigator (3 tabs)
    index.tsx
    explore.tsx
    profile.tsx
context/
  auth-context.tsx     — AuthContext, AuthProvider, useAuth
docs/
```

## Technical Decisions (ADRs)
| Date       | Decision                                        | Rationale                                              |
|------------|-------------------------------------------------|--------------------------------------------------------|
| 2026-04-29 | Route groups (auth) and (home) via Expo Router  | Clean separation of unauthenticated vs authenticated   |
| 2026-04-29 | AuthContext with React Context + useAuth hook   | Lightweight, no external state lib needed at this stage|
| 2026-04-29 | Redirect in root _layout.tsx based on auth state| Single source of truth for auth-gated navigation       |
| 2026-04-29 | StyleSheet.create inline per file               | No UI lib, keeps styles co-located                     |

## Restrictions
- No additional npm dependencies (only what is already in package.json)
- TypeScript strict, no `any`
- No comments in code unless required for clarity
- Styles via StyleSheet.create only — no external styling lib
