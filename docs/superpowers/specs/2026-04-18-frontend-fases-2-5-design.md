# Design: Frontend Fases 2–5 — Streaming Hub Local

**Data:** 2026-04-18  
**Stack:** React 18 + Vite 5 + Tailwind CSS 3 + Context API + React Router 6  
**Estilo:** Modern Slate (fundo `#0f172a`, sidebar `#1e293b`, accent `#38bdf8`)

---

## 1. Rotas

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/` | `LoginPage` | Público |
| `/dashboard` | `DashboardPage` | Protegida |
| `/settings` | `SettingsPage` | Protegida |
| `/player/:tmdbId` | `PlayerPage` | Protegida |

Rotas protegidas envolvidas em `<PrivateRoute>` — redireciona para `/` se não autenticado.

---

## 2. Arquitetura de Componentes

```
App
└── AuthProvider          # JWT, user, login(), logout()
    └── CredentialsProvider  # credentials[], activeProviderIds[], refresh()
        └── Router
            ├── / → LoginPage
            └── PrivateRoute
                └── Layout  # Sidebar + <Outlet>
                    ├── /dashboard → DashboardPage
                    ├── /settings  → SettingsPage
                    └── /player/:tmdbId → PlayerPage
```

### Layout (Sidebar)
Sidebar fixa de ícones (52px) com: logo `◈`, link Dashboard, link Settings, spacer, botão Logout. Ativa o ícone da rota atual com `#38bdf8`.

---

## 3. State Management — Context API

### AuthContext
- `token` — armazenado em `localStorage`
- `isAuthenticated` — booleano derivado de token válido
- `login(username, password)` — POST `/api/auth/login`, salva token
- `logout()` — limpa token, redireciona para `/`
- Interceptor em `api.js` injeta `Authorization: Bearer <token>` em todas as requisições; se resposta 401, chama `logout()`

### CredentialsContext
- `credentials[]` — lista completa de credenciais
- `activeProviderIds[]` — array de `providerId` onde `active === true`
- `refresh()` — GET `/api/credentials`, atualiza estado
- Carregado ao montar (após autenticação)

---

## 4. Hooks

| Hook | Endpoint | Descrição |
|------|----------|-----------|
| `useAuth()` | — | Acessa AuthContext |
| `useCredentials()` | — | Acessa CredentialsContext |
| `useMovies(page, genre)` | `GET /api/stream/movies` | Filmes filtrados por `activeProviderIds` |
| `useSeries(page, genre)` | `GET /api/stream/series` | Séries filtradas por `activeProviderIds` |
| `useSearch(query)` | `GET /api/stream/search` | Busca unificada — não filtra por provider (retorna todos os resultados) |
| `useGenres()` | `GET /api/stream/genres` | Cache local via `useState` |

---

## 5. Telas

### LoginPage (`/`)
- Campo **Usuário** + campo **Senha**
- Botão "Entrar"
- Aviso de rate limit (5 tentativas / 15 min)
- Toast de erro em credenciais inválidas
- **Requer alteração no backend:** `auth.controller.js` deve validar `{ username, password }` contra `PLATFORM_USER` + `PLATFORM_PASSWORD` no `.env`

### DashboardPage (`/dashboard`)
- Barra de busca + dropdown de gênero
- Abas **Filmes** / **Séries**
- Grid de posters (cards com badge do provider ativo)
- Skeleton cards durante loading
- Se nenhum provider ativo: exibe catálogo completo + aviso "Nenhum serviço ativo"
- Clique no card navega para `/player/:tmdbId`

### SettingsPage (`/settings`)
- Formulário: dropdown Serviço + campo Email + campo Senha + botão **Salvar e Validar**
- Botão aciona `POST /api/credentials` → Puppeteer valida antes de salvar
- Feedback de loading durante validação ("Validando login...")
- Mensagem de erro se Puppeteer falhar ou timeout
- Lista de credenciais salvas com badge de status (✓ Ativo / ✗ Inválido) e botão de delete

### PlayerPage (`/player/:tmdbId`)
- Botão "← Voltar" para Dashboard
- `<iframe>` com a URL do streamer — mapeamento fixo em `src/services/providers.js`: `{ Netflix: 'https://netflix.com', 'Prime Video': 'https://primevideo.com', 'HBO Max': 'https://play.max.com', 'Disney+': 'https://disneyplus.com' }`
- O card no Dashboard passa `streamerName` via state do React Router ao navegar para `/player/:tmdbId`
- Metadados TMDB: poster, título, ano, gêneros, sinopse — carregados via `GET /api/stream/movies` ou `/series` filtrando por `tmdbId`
- Badge do provider ativo (derivado do `streamerName` recebido via route state)

---

## 6. Backend — Alterações Necessárias

### `auth.controller.js`
Adicionar validação de `username`:
```js
// .env: PLATFORM_USER=admin, PLATFORM_PASSWORD=senha
const { username, password } = req.body
if (!username || !password) throw new ValidationError(...)
if (username !== PLATFORM_USER || password !== PLATFORM_PASSWORD) throw new UnauthorizedError(...)
```

### `.env.example`
Adicionar: `PLATFORM_USER=admin`

---

## 7. Estrutura de Arquivos (client/)

```
client/src/
├── components/
│   ├── Layout.jsx          # Sidebar + Outlet
│   ├── PrivateRoute.jsx    # Guarda de rota
│   ├── MovieCard.jsx       # Poster + badge provider
│   ├── SkeletonCard.jsx    # Loading placeholder
│   └── Toast.jsx           # Notificações de erro/sucesso
├── contexts/
│   ├── AuthContext.jsx
│   └── CredentialsContext.jsx
├── hooks/
│   ├── useMovies.js
│   ├── useSeries.js
│   ├── useSearch.js
│   └── useGenres.js
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── SettingsPage.jsx
│   └── PlayerPage.jsx
├── services/
│   └── api.js              # axios com interceptor JWT
└── main.jsx
```

---

## 8. Tratamento de Erros

- Erros de API → toast com `error.message` do backend
- 401 em qualquer rota → logout automático + redirect `/`
- Puppeteer timeout → "Validação demorou muito, tente novamente"
- Loading states → skeleton cards no grid

---

## 9. Testes

| Fase | Ferramenta | O que testar |
|------|-----------|-------------|
| 2 — Frontend | Vitest + Testing Library | `LoginPage` submit/erro, `SettingsPage` add/delete, `PrivateRoute` redirect |
| 3 — Puppeteer | Jest + Supertest | `validation.controller` com mock de Puppeteer |
| 4 — TMDB | Vitest | `useMovies`/`useSeries` com fetch mockado |
| 5 — Player | Vitest | Renderização do iframe com `tmdbId` correto |

---

## 10. Fases de Implementação

| Fase | Descrição |
|------|-----------|
| **2** | Frontend: Login, Layout, Dashboard (mock data), Settings UI |
| **3** | Validação Puppeteer (backend já tem rota, implementar lógica) |
| **4** | Dashboard TMDB real com filtro por `activeProviderIds` |
| **5** | PlayerPage com iframe + metadados TMDB |
