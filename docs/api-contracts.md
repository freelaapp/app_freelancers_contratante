# API Contracts

## Base URL
- Production: TBD
- Staging: TBD
- Local: http://localhost:3000

## Authentication
- Type: Bearer JWT (future)
- Header: Authorization: Bearer {token}

## Endpoints

### Auth (simulated — no real backend yet)

#### POST /auth/signin (SIMULATED)
Simulated via setTimeout in AuthContext. Returns a fake user object after 1s.

**Request:**
```json
{ "email": "string", "password": "string" }
```

**Response 200:**
```json
{ "id": "1", "name": "Usuário Teste", "email": "string" }
```

**Errors:** 401 (not yet implemented)

> Note: When real backend is available, replace setTimeout simulation in `context/auth-context.tsx` signIn function with actual fetch call.
