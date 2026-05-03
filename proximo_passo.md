# Próximos Passos

> **Regra geral para o agent dev:** toda feature, componente, screen, hook ou utilitário implementado no projeto **obrigatoriamente** deve vir acompanhado de seus testes unitários, de integração e/ou automatizados. Nenhuma implementação é considerada concluída sem cobertura de testes.

---

## 1. Validações com React Hook Form + Yup

- Instalar dependências: `react-hook-form`, `yup`, `@hookform/resolvers`
- Criar pasta `src/schemas/` com um arquivo de schema por tela/domínio:
  - `src/schemas/criar-vaga.schema.ts`
  - `src/schemas/login.schema.ts`
  - `src/schemas/register.schema.ts`
  - `src/schemas/avaliacao.schema.ts`
- Substituir todos os estados controlados (`useState`) de formulários por `useForm` + `Controller`
- Usar `yupResolver` para integrar o schema ao `useForm`
- Padronizar mensagens de erro em português no schema
- Exibir erros inline abaixo de cada campo com componente `ErrorMessage`

---

## 2. Plano completo de testes do projeto

### 2.1 Setup de infraestrutura de testes

- Instalar e configurar: `jest`, `@testing-library/react-native`, `@testing-library/jest-native`, `msw` (Mock Service Worker)
- Configurar `jest.config.js` com preset `jest-expo`
- Configurar `jest.setup.ts` com mocks globais (`@expo/vector-icons`, `expo-router`, `react-native-safe-area-context`, `expo-linear-gradient`)
- Criar pasta `src/__tests__/` com subpastas espelhando a estrutura do projeto:
  ```
  src/__tests__/
    components/
    screens/
    hooks/
    utils/
    schemas/
    flows/         ← testes de fluxo ponta a ponta (E2E simulado)
  ```

### 2.2 Testes unitários — Componentes

Cada componente em `src/components/` deve ter seu arquivo `*.test.tsx`:

| Componente | O que testar |
|---|---|
| `AvatarInitials` | renderiza iniciais, tamanho correto, cor de fundo customizada |
| `StarRating` | renderiza 5 estrelas, conta filled vs empty, modo interativo dispara `onPress` |
| `Divider` | renderiza horizontal (height: 1), vertical (width: 1), `marginHorizontal` aplicado |
| `CardContainer` | renderiza children, aceita `style` override |
| `StatusBadge` | cor e label corretos para cada status (`confirmado`, `aguardando`, `finalizado`, `aceito`, `recusado`, `cancelado`) |
| `CardHeader` | renderiza ícone e título, `iconColor` e `iconSize` customizados |
| `BottomActionBar` | renderiza children, `showTopBorder` aplica borda, `backgroundColor` customizado |
| `FilterChipBar` | renderiza todas as opções, chip ativo tem estilo correto, `onSelect` chamado ao pressionar |
| `CenteredModal` | renderiza quando `visible=true`, não renderiza quando `visible=false`, `onClose` chamado ao pressionar backdrop |
| `BookingCard` | renderiza título, local, data, valor, badge de status correto para cada status |
| `VagaCard` | idem BookingCard + ícones de data/hora corretos |
| `PrimaryButton` | label renderizado, `onPress` chamado, estado disabled |
| `SectionHeader` | título e ícone renderizados |
| `PageHeader` | botão voltar chama `router.back()`, prop `inline` altera layout |

### 2.3 Testes unitários — Schemas Yup

Cada schema em `src/schemas/` deve ter seu arquivo `*.test.ts`:

| Schema | O que testar |
|---|---|
| `login.schema` | email inválido, senha curta, campos obrigatórios |
| `register.schema` | todos os campos obrigatórios, formato de email, senha com confirmação |
| `criar-vaga.schema` | título obrigatório, data válida, valor numérico positivo, descrição mínima |
| `avaliacao.schema` | estrelas entre 1–5, comentário obrigatório, campo `compareceu` obrigatório |

### 2.4 Testes unitários — Hooks e utilitários

| Arquivo | O que testar |
|---|---|
| `src/utils/vagas-mock.ts` | tipos corretos, IDs únicos, `stepAtual` dentro do range 0–6 |
| `src/utils/avaliacoes-mock.ts` | estrutura dos dados, campos obrigatórios presentes |
| `src/context/auth-context.tsx` | `useAuth` retorna `user`, `login` atualiza estado, `logout` limpa estado |
| `gerarCodigo()` (em vaga/[id]) | extração para `src/utils/gerar-codigo.ts` + teste: 6 chars, apenas chars válidos |

### 2.5 Testes de integração — Telas

| Tela | O que testar |
|---|---|
| `login.tsx` | submit com dados válidos navega para home, erros de validação exibidos, loading state |
| `register.tsx` | submit com dados válidos navega, validações de todos os campos |
| `criar-vaga.tsx` | campos validados antes do submit, botão desabilitado sem dados |
| `vagas.tsx` | filtros alteram lista exibida, tap em card navega para detalhe |
| `vaga/[id].tsx` | step inicial correto por ID, CTA avança step, modais abrem/fecham, avaliação reseta estado |
| `notificacoes.tsx` | tabs alternam conteúdo, badge de contagem exibido |
| `profile.tsx` | dados do usuário exibidos, menu items renderizados |

### 2.6 Testes de fluxo (E2E simulado)

Fluxos completos testados com `@testing-library/react-native` + mocks de navegação:

| Fluxo | Steps cobertos |
|---|---|
| **Fluxo completo de vaga** (id "5") | Aceitar candidato → Confirmar seleção → Confirmar pagamento → Check-in (modal + código) → Check-out (modal + código) → Confirmar repasse → Avaliar (estrelas + comentário + compareceu) → tela fecha |
| **Autenticação** | Login com credenciais válidas → redirect home; login inválido → erro exibido; logout → volta para login |
| **Criação de vaga** | Preencher formulário → validações → submit → navegação de volta |

### 2.7 Testes automatizados — CI

- Configurar `GitHub Actions` em `.github/workflows/test.yml`:
  - Rodar `jest --coverage` a cada push e pull request
  - Bloquear merge se cobertura cair abaixo de **70%** (componentes) / **60%** (screens)
  - Exibir relatório de cobertura como comentário automático na PR
- Configurar thresholds no `jest.config.js`:
  ```js
  coverageThreshold: {
    global: { branches: 60, functions: 70, lines: 70, statements: 70 }
  }
  ```

---

## 3. Cobertura de testes após implementação da API

- Mapear todos os endpoints consumidos pela aplicação
- Criar handlers `msw` em `src/__mocks__/handlers/` por domínio (vagas, auth, freelancers)
- Substituir mocks estáticos por chamadas reais mockadas com `msw`
- Atualizar testes existentes para cobrir estados de loading, erro de rede e timeout
- Meta de cobertura pós-API: **80%+ linhas**

---

## 4. Análise de padrões de projeto e escalabilidade

- Rodar o agent dev para auditoria completa do projeto com foco em:
  - Arquitetura de pastas e separação de responsabilidades
  - Padrões de estado global (Context API vs Zustand vs Jotai)
  - Consistência de tipagem TypeScript (strict mode, generics, ausência de `any`)
  - Performance (memoização, lazy loading, evitar re-renders desnecessários)
  - Acessibilidade (labels, roles, contraste)
  - Segurança (exposição de tokens, validação de inputs)
- Gerar relatório com score por categoria
- Definir ajustes prioritários com base no relatório

---

## 5. Ajustes com prompt gerado por IA

- Com base no relatório de padrões (passo 4), gerar um prompt detalhado descrevendo todos os problemas encontrados
- Passar o prompt para o agent dev implementar os ajustes em lote
- **Todo ajuste implementado deve vir acompanhado de testes** (regra geral reforçada)
- Validar resultado com nova rodada de auditoria
- Criar PR com todas as melhorias documentadas

---

## Ordem sugerida de execução

```
1 → Setup de infraestrutura de testes (jest + testing-library + msw)
2 → Validações (RHF + Yup + schemas) + testes dos schemas
3 → Testes unitários de componentes e utilitários
4 → Análise de padrões + ajustes com IA (com testes obrigatórios)
5 → Implementação da API real
6 → Testes de integração + E2E pós-API
7 → CI/CD com cobertura automatizada bloqueando merge
```

---

## Regra do agent dev — obrigatoriedade de testes

> Toda vez que o agent dev for acionado para implementar qualquer coisa no projeto — feature, componente, screen, hook, utilitário, schema, serviço de API ou refatoração — ele **deve automaticamente**:
>
> 1. Criar o arquivo de teste correspondente (`*.test.tsx` ou `*.test.ts`)
> 2. Cobrir o happy path, edge cases e estados de erro
> 3. Rodar `jest --testPathPattern=<arquivo>` para confirmar que todos os testes passam
> 4. Reportar a cobertura do arquivo implementado
>
> Nenhuma tarefa é considerada concluída sem os testes passando.
