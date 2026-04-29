# Business Rules

## Domain
Freelance contractor marketplace app (freela-contrantate). Users authenticate to access home tabs.

## Business Rules

### Authentication
- BR-001: Unauthenticated users must be redirected to /auth/login
- BR-002: signIn simulates async call (1s delay) and sets a fake user object
- BR-003: signOut clears user state and navigation redirects to /auth/login
- BR-004: While auth state is loading (isLoading true), show ActivityIndicator — do not redirect

### Navigation
- BR-005: Authenticated users land on (home) tab group
- BR-006: Auth screens (login, register) are not accessible once authenticated

## Business Restrictions
- No real backend auth at this stage — all auth is simulated

## Glossary
| Term    | Definition                              |
|---------|-----------------------------------------|
| user    | Object with { id, name, email } fields  |
| signIn  | Simulated async authentication function |
| signOut | Clears auth state                       |
