# Status Report — Freela Contratante (App)
**Data:** 2026-05-08  
**Stack:** React Native 0.81.5 + Expo 54 + Expo Router 6 + TypeScript

---

## Resumo Executivo

MVP funcional com todos os fluxos críticos de negócio implementados e testados. O app cobre o ciclo completo contratante: criação de vaga → candidaturas → check-in/out → pagamento PIX → avaliação. Infraestrutura de testes sólida (33 arquivos), com gap em cobertura de componentes UI (1 de 28 testado).

---

## Telas — Status por Grupo

### Autenticação (5 telas) — Completo

| Tela | O que faz |
|---|---|
| Login | Email + senha, validação Yup, error handling, loading state |
| Register | Cadastro novo usuário (nome, email, telefone, senha) |
| Confirm Email | Confirmação de código de 6 dígitos enviado por email |
| Forgot Password | Solicitar reset de senha + nova senha com validação |
| Completar Cadastro | Onboarding pós-registro: CPF/CNPJ, endereço, tipo de contratante |

### Home / App (14 telas)

| Tela | O que faz | Status |
|---|---|---|
| Home (index) | Dashboard com vagas ativas, saldo do mês, avaliação | Completo |
| Vagas | Listagem de vagas criadas pelo contratante | Completo |
| Criar Vaga | Fluxo 4 steps: data → serviço → horário → revisão + submit | Completo |
| Vaga [id] | Detalhe da vaga com 7 steps de progresso (aberta → paga → avaliada) | Completo |
| Avaliações | Histórico de feedbacks dados a freelancers | Completo |
| Perfil | Dados do contratante, avatar, logout, menu de configurações | Completo |
| Meus Dados | Edição de nome, email, dados da empresa, endereço via ViaCEP | Completo |
| Financeiro | Dashboard de gastos: mês atual, histórico, status por vaga | Completo |
| Configurações | Notificações, links legais, segurança | Completo |
| Notificações | Centro com tabs (notificações + mensagens), badge de não lidos | Completo |
| Ajuda | FAQ accordion + botão WhatsApp para suporte | Básico |
| Termos de Uso | Conteúdo legal LGPD (11 seções) | Completo |
| Política de Privacidade | Conteúdo legal LGPD (11 seções) | Completo |
| Explore | Marketplace de freelancers | **Esboço — não funcional** |

---

## Serviços de API (12 implementados)

| Serviço | Endpoints cobertos |
|---|---|
| `authService` | register, login, getProfile, confirmEmail, resendCode |
| `vagasService` | listByContractor, getById, create (com payload correto vs. contrato) |
| `jobsService` | createByVacancy, generateCheckinCode, generateCheckoutCode, confirmCheckin/out |
| `candidaturasService` | acceptCandidacy, rejectCandidacy, listByCandidacy |
| `paymentsService` | createPayment, checkStatus, confirmPayment (PIX 30min TTL) |
| `feedbacksService` | create (rating + comment), listByContractor |
| `contractorService` | create/update (home-services e bars-restaurants), getCities |
| `summaryService` | getContractorSummary (saldo, vagas, avaliação) |
| `api` (Axios base) | Refresh token automático, 401 handler, toast de erro, 10s timeout |
| `tokenStore` | SecureStore para JWT + refresh token + dados do usuário |
| `use-via-cep` | Busca de endereço por CEP (localidade, logradouro, bairro, UF) |
| `optimistic-vagas-store` | Store de módulo com TTL 1h para vagas criadas localmente |

---

## Fluxos de Negócio Implementados

### 1. Criar e publicar vaga ✓
- 4 steps com validação por etapa
- Tipo de serviço com tarifas calculadas automaticamente
- Filtro de horários por tipo de serviço (ex: DJ só das 14h–23h)
- Detecção de conflito de horário com vagas existentes antes do submit
- Payload alinhado com contrato da API: `serviceType` em UPPER_CASE, `cityId`, timezone BRT→UTC corrigido

### 2. Gerenciar candidatos ✓
- Aceitar / rejeitar candidaturas
- Visualizar perfil do freelancer (nome, avaliação, jobs anteriores)

### 3. Check-in / Check-out ✓
- Gerar código de 6 caracteres para o freelancer validar
- Confirmar presença e encerramento

### 4. Pagamento PIX ✓
- Criação de pagamento por job
- Polling de status (TTL 30 minutos)
- Confirmação e repasse

### 5. Avaliação ✓
- Modal de feedback ao status "finalizado"
- Rating 1–5 estrelas + comentário opcional
- Histórico de avaliações dadas

---

## Componentes Reutilizáveis (28)

Todos funcionais e em uso nas telas. Destacados:

- `BookingCard` — card de vaga com status, valor, data/hora, local
- `StarRating` — rating interativo 1–5
- `StatusBadge` — badge por status com cores mapeadas
- `CenteredModal` — modal reutilizável (usado em feedback, check-in, etc.)
- `BottomActionBar` — barra de ação fixa no rodapé (evita sobreposição)
- `FilterChipBar` / `ServiceChip` — filtros de listagem
- `FreelancerProfileSheet` — bottom sheet com perfil do candidato
- `HomeHeader` — header do dashboard com saldo, vagas, avaliação e ações

---

## Testes

| Área | Arquivos | Status |
|---|---|---|
| Screens | 8 arquivos (home, vaga-detail, meus-dados, ajuda, login, criar-vaga, termos, privacidade) | ✓ |
| Services | 10 arquivos (vagas, jobs, payments, candidaturas, auth, api, feedbacks, etc.) | ✓ |
| Hooks | 1 arquivo (useHomeVagas — 11 testes incluindo remount e race condition) | ✓ |
| Contexts | 2 arquivos (auth-context, notifications-context) | ✓ |
| Validação | 5 arquivos (todos os schemas Yup) | ✓ |
| Utils | 5 arquivos (status-map, vaga-filters, pending-store, payload, toast) | ✓ |
| Componentes | 1 de 28 (apenas Input) | ⚠ Baixo |

**Total: 33 arquivos de teste**

---

## Segurança

| Item | Status |
|---|---|
| JWT armazenado em SecureStore (não AsyncStorage) | ✓ |
| Refresh token automático com interceptor Axios | ✓ |
| Validação de inputs com Yup em todos os forms | ✓ |
| Error messages genéricas (não expõe dados internos) | ✓ |
| Bearer Authorization header em todas as chamadas autenticadas | ✓ |

---

## O que Falta / Pendências

### Prioridade Alta

| Item | Descrição |
|---|---|
| **Tela Explore** | Marketplace de freelancers está como esboço — não funcional. Endpoint `/v1/bars-restaurants/vacancies` (listagem pública) existe no swagger mas não está integrado |
| **Cobertura de componentes** | 27 de 28 componentes sem testes. Aumentar cobertura de ~3% para ≥50% antes de Go Live |
| **Console.log de debug** | `step4-overview.tsx` e `vagas.service.ts` têm logs de debug adicionados durante desenvolvimento — remover antes de produção |

### Prioridade Média

| Item | Descrição |
|---|---|
| **Chat / Mensagens** | Aba de mensagens visível no centro de notificações mas sem implementação |
| **Imagens do estabelecimento** | Schema de `meus-dados` tem campos para fotos do estabelecimento, mas upload não implementado |
| **Push Notifications reais** | `NotificationsContext` é local (AsyncStorage). Não há integração com FCM/APNs/Expo Push |
| **Social Auth (Google)** | Endpoint `/v1/users/google/connect` documentado no swagger, não implementado no app |

### Prioridade Baixa / Melhorias

| Item | Descrição |
|---|---|
| CI/CD | Sem pipeline de testes automáticos (GitHub Actions). Recomendado: coverage gate mínimo 70% |
| E2E Tests | Sem testes de integração ponta-a-ponta (Detox ou Maestro) |
| Infinite scroll | Listas de vagas usam `ScrollView` simples — considerar `FlatList` paginada |
| `vaga/[id].tsx` | Arquivo com 600+ linhas — candidato a split em subcomponentes |
| Retry logic | Sem exponential backoff em falhas de rede |
| Número de suporte hardcoded | `wa.me/5511999999999` é placeholder — substituir pelo número real |

---

## Arquitetura

```
src/
├── app/                     # Expo Router (file-based routing)
│   ├── _layout.tsx          # Root + AuthProvider + NotificationsProvider
│   ├── (auth)/              # Grupo de rotas não autenticadas
│   └── (home)/              # Grupo de rotas autenticadas
├── components/              # 28 componentes reutilizáveis
│   └── steps-criar-vaga/    # 6 componentes do fluxo multi-step
├── services/                # 12 serviços de API (Axios)
├── hooks/                   # 4 hooks customizados
├── context/                 # AuthContext + NotificationsContext
├── validation/              # 5 schemas Yup
├── types/                   # Tipos TypeScript compartilhados
├── utils/                   # Helpers, stores, formatadores
├── constants/               # Theme (cores, tipografia, espaçamentos)
└── __tests__/               # 33 arquivos de teste
```

**Pontos positivos de arquitetura:**
- Route groups `(auth)` e `(home)` com guard de navegação centralizado no `_layout.tsx`
- Service layer desacoplado da UI
- `optimistic-vagas-store` de módulo para UX sem travar na latência da API
- Tokens em SecureStore (não em memória)
- Context API suficiente para o escopo atual — sem over-engineering

---

## Checklist para Go Live

- [x] Autenticação completa (login, registro, email, reset senha)
- [x] Onboarding de contratante
- [x] Criar, listar e detalhar vagas
- [x] Aceitar/rejeitar candidatos
- [x] Check-in / Check-out
- [x] Pagamento PIX
- [x] Avaliação de freelancers
- [x] Dashboard financeiro
- [x] Termos de Uso e Política de Privacidade (LGPD)
- [ ] Tela Explore (marketplace)
- [ ] Chat / Mensagens
- [ ] Push Notifications reais (FCM/APNs)
- [ ] Remoção dos console.log de debug
- [ ] Cobertura de testes de componentes ≥ 50%
- [ ] Número WhatsApp de suporte real
- [ ] CI/CD com gate de cobertura
