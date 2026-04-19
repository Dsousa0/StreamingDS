# Frontend Fases 2–5 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o frontend completo (React 18 + Vite + Tailwind) e integrar as fases 2–5 do Streaming Hub Local sobre o backend já existente.

**Architecture:** Context API para auth e credenciais, React Router v6 com PrivateRoute + Layout (sidebar fixa), quatro páginas (Login, Dashboard, Settings, Player). Backend já tem todas as rotas; única alteração necessária é adicionar validação de `username` no auth controller.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, React Router DOM 6, Axios, Vitest, @testing-library/react

---

## File Map

### Backend (modificar)
- `server/src/controllers/auth.controller.js` — adicionar validação de username
- `server/src/config/env.js` — expor PLATFORM_USER
- `.env.example` — adicionar PLATFORM_USER

### Frontend (criar do zero)
- `client/index.html` — entry point HTML do Vite
- `client/tailwind.config.js` — configuração Tailwind
- `client/postcss.config.js` — PostCSS para Tailwind
- `client/vitest.config.js` — configuração de testes
- `client/src/test/setup.js` — jest-dom setup
- `client/src/index.css` — @tailwind directives
- `client/src/main.jsx` — ReactDOM.createRoot
- `client/src/App.jsx` — BrowserRouter + Routes
- `client/src/services/api.js` — axios singleton com interceptor JWT
- `client/src/services/providers.js` — mapeamento streamer→URL+providerId
- `client/src/contexts/AuthContext.jsx` — token, login(), logout(), interceptor 401
- `client/src/contexts/CredentialsContext.jsx` — credentials[], activeProviderIds[], refresh()
- `client/src/components/PrivateRoute.jsx` — Outlet ou Navigate to /
- `client/src/components/Layout.jsx` — sidebar fixa + Outlet
- `client/src/components/Toast.jsx` — notificação auto-dismiss
- `client/src/components/SkeletonCard.jsx` — placeholder animado
- `client/src/components/MovieCard.jsx` — poster + badge provider
- `client/src/hooks/useMovies.js` — GET /api/stream/movies
- `client/src/hooks/useSeries.js` — GET /api/stream/series
- `client/src/hooks/useSearch.js` — GET /api/stream/search (debounce 400ms)
- `client/src/hooks/useGenres.js` — GET /api/stream/genres (cache local)
- `client/src/pages/LoginPage.jsx` — form usuário+senha
- `client/src/pages/DashboardPage.jsx` — grid de filmes/séries com filtros
- `client/src/pages/SettingsPage.jsx` — CRUD de credenciais + validação Puppeteer
- `client/src/pages/PlayerPage.jsx` — iframe + metadados TMDB

### Testes
- `client/src/__tests__/PrivateRoute.test.jsx`
- `client/src/__tests__/LoginPage.test.jsx`
- `client/src/__tests__/useMovies.test.js`
- `client/src/__tests__/PlayerPage.test.jsx`

---

## Task 1: Backend — auth com username

**Files:**
- Modify: `server/src/controllers/auth.controller.js`
- Modify: `server/src/config/env.js`
- Modify: `.env.example`

- [ ] **Step 1: Atualizar auth.controller.js**

```js
// server/src/controllers/auth.controller.js
require('dotenv').config()
const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { UnauthorizedError, ValidationError } = require('../utils/errors')

const PLATFORM_USER = process.env.PLATFORM_USER || 'admin'
const PLATFORM_PASSWORD = process.env.PLATFORM_PASSWORD || 'admin'

exports.login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) throw new ValidationError('Usuário e senha são obrigatórios')
  if (username !== PLATFORM_USER || password !== PLATFORM_PASSWORD) {
    throw new UnauthorizedError('Credenciais inválidas')
  }
  const token = jwt.sign({ platform: true }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
  res.json({ token })
}
```

- [ ] **Step 2: Adicionar PLATFORM_USER ao .env.example**

Abrir `.env.example` e adicionar após a linha `PLATFORM_PASSWORD`:
```
# Usuário de acesso à plataforma local
PLATFORM_USER=admin
```

- [ ] **Step 3: Adicionar PLATFORM_USER ao .env local**

```bash
echo "PLATFORM_USER=admin" >> .env
```

- [ ] **Step 4: Testar endpoint manualmente**

Com o servidor rodando (`npm run dev:server`):
```bash
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<PLATFORM_PASSWORD do .env>"}' | cat
```
Esperado: `{"token":"eyJ..."}`

```bash
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"errado","password":"errado"}' | cat
```
Esperado: `{"error":{"code":"UNAUTHORIZED","message":"Credenciais inválidas"}}`

- [ ] **Step 5: Commit**

```bash
git add server/src/controllers/auth.controller.js .env.example
git commit -m "feat: adicionar validação de username no login da plataforma"
```

---

## Task 2: Client — scaffold (HTML, CSS, Tailwind, Vitest)

**Files:**
- Create: `client/index.html`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/vitest.config.js`
- Create: `client/src/test/setup.js`
- Create: `client/src/index.css`
- Modify: `client/package.json`

- [ ] **Step 1: Atualizar package.json com devDependencies de teste e script**

```json
{
  "name": "streamingds-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.24.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.3.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Criar client/index.html**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Streaming Hub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Criar client/tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 4: Criar client/postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Criar client/vitest.config.js**

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

- [ ] **Step 6: Criar client/src/test/setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Criar client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Instalar dependências**

```bash
cd client && npm install
```

Esperado: sem erros. `node_modules/vitest` e `node_modules/@testing-library` devem existir.

- [ ] **Step 9: Verificar que Tailwind resolve**

```bash
cd client && npx tailwindcss --input src/index.css --output /dev/null
```

Esperado: sem erros.

- [ ] **Step 10: Commit**

```bash
git add client/index.html client/tailwind.config.js client/postcss.config.js client/vitest.config.js client/src/test/setup.js client/src/index.css client/package.json
git commit -m "chore: scaffold cliente — Tailwind, Vitest, index.html"
```

---

## Task 3: Serviços — api.js e providers.js

**Files:**
- Create: `client/src/services/api.js`
- Create: `client/src/services/providers.js`

- [ ] **Step 1: Criar client/src/services/api.js**

```js
import axios from 'axios'

const api = axios.create()

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

- [ ] **Step 2: Criar client/src/services/providers.js**

```js
export const PROVIDERS = {
  Netflix: { url: 'https://www.netflix.com', providerId: 8 },
  'Prime Video': { url: 'https://www.primevideo.com', providerId: 119 },
  'HBO Max': { url: 'https://play.max.com', providerId: 1899 },
  'Disney+': { url: 'https://www.disneyplus.com', providerId: 337 },
}

export const PROVIDER_NAMES = Object.keys(PROVIDERS)
```

- [ ] **Step 3: Commit**

```bash
git add client/src/services/
git commit -m "feat: criar api.js (axios + interceptor JWT) e providers.js"
```

---

## Task 4: AuthContext

**Files:**
- Create: `client/src/contexts/AuthContext.jsx`

- [ ] **Step 1: Criar client/src/contexts/AuthContext.jsx**

```jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const isAuthenticated = Boolean(token)

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    setToken(data.token)
    localStorage.setItem('token', data.token)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem('token')
  }, [])

  // Interceptor de 401: logout automático em qualquer resposta não autorizada
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) logout()
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [logout])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/contexts/AuthContext.jsx
git commit -m "feat: AuthContext — JWT, login/logout, interceptor 401"
```

---

## Task 5: PrivateRoute e Layout

**Files:**
- Create: `client/src/components/PrivateRoute.jsx`
- Create: `client/src/components/Layout.jsx`
- Create: `client/src/__tests__/PrivateRoute.test.jsx`

- [ ] **Step 1: Escrever o teste que falha**

```jsx
// client/src/__tests__/PrivateRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import PrivateRoute from '../components/PrivateRoute'

function wrap(isAuthenticated, initialPath = '/dashboard') {
  return render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<div>Login</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<div>Protected</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('renderiza conteúdo protegido quando autenticado', () => {
  wrap(true)
  expect(screen.getByText('Protected')).toBeInTheDocument()
})

test('redireciona para / quando não autenticado', () => {
  wrap(false)
  expect(screen.getByText('Login')).toBeInTheDocument()
  expect(screen.queryByText('Protected')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
cd client && npm test -- PrivateRoute
```

Esperado: FAIL — `Cannot find module '../components/PrivateRoute'`

- [ ] **Step 3: Criar client/src/components/PrivateRoute.jsx**

```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
```

- [ ] **Step 4: Rodar teste — deve passar**

```bash
cd client && npm test -- PrivateRoute
```

Esperado: PASS (2 testes)

- [ ] **Step 5: Criar client/src/components/Layout.jsx**

```jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const iconClass = ({ isActive }) =>
    isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300 transition-colors'

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <aside className="w-14 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 gap-5 flex-shrink-0">
        <span className="text-sky-400 text-lg font-bold select-none">◈</span>
        <NavLink to="/dashboard" className={iconClass} title="Dashboard">
          <span className="text-xl">⊟</span>
        </NavLink>
        <NavLink to="/settings" className={iconClass} title="Configurações">
          <span className="text-xl">⚙</span>
        </NavLink>
        <div className="flex-1" />
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 transition-colors text-xl"
          title="Sair"
        >
          ⏻
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add client/src/components/PrivateRoute.jsx client/src/components/Layout.jsx client/src/__tests__/PrivateRoute.test.jsx
git commit -m "feat: PrivateRoute e Layout com sidebar fixa"
```

---

## Task 6: Componentes utilitários — Toast, SkeletonCard, MovieCard

**Files:**
- Create: `client/src/components/Toast.jsx`
- Create: `client/src/components/SkeletonCard.jsx`
- Create: `client/src/components/MovieCard.jsx`

- [ ] **Step 1: Criar client/src/components/Toast.jsx**

```jsx
import { useEffect } from 'react'

const COLORS = {
  error: 'bg-red-500',
  success: 'bg-green-600',
  info: 'bg-sky-500',
}

export default function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-xl max-w-xs ${COLORS[type]}`}
    >
      {message}
    </div>
  )
}
```

- [ ] **Step 2: Criar client/src/components/SkeletonCard.jsx**

```jsx
export default function SkeletonCard() {
  return (
    <div className="aspect-[2/3] rounded-md bg-slate-700 animate-pulse" />
  )
}
```

- [ ] **Step 3: Criar client/src/components/MovieCard.jsx**

```jsx
const TMDB_IMG = 'https://image.tmdb.org/t/p/w300'

export default function MovieCard({ item, streamerName, onClick }) {
  const title = item.title || item.name || '—'
  const posterUrl = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="relative cursor-pointer rounded-md overflow-hidden bg-slate-700 aspect-[2/3] group focus:outline-none focus:ring-2 focus:ring-sky-400"
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs p-2 text-center leading-tight">
          {title}
        </div>
      )}
      {streamerName && (
        <span className="absolute bottom-1 left-1 bg-sky-400 text-slate-900 text-xs px-1.5 py-0.5 rounded font-semibold">
          {streamerName}
        </span>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/Toast.jsx client/src/components/SkeletonCard.jsx client/src/components/MovieCard.jsx
git commit -m "feat: componentes Toast, SkeletonCard e MovieCard"
```

---

## Task 7: LoginPage

**Files:**
- Create: `client/src/pages/LoginPage.jsx`
- Create: `client/src/__tests__/LoginPage.test.jsx`

- [ ] **Step 1: Escrever o teste que falha**

```jsx
// client/src/__tests__/LoginPage.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext } from '../contexts/AuthContext'
import LoginPage from '../pages/LoginPage'

function wrap(loginFn = vi.fn(), isAuthenticated = false) {
  return render(
    <AuthContext.Provider value={{ login: loginFn, isAuthenticated }}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('renderiza campos de usuário e senha', () => {
  wrap()
  expect(screen.getByPlaceholderText('Usuário')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
})

test('chama login com username e password ao submeter', async () => {
  const loginFn = vi.fn().mockResolvedValue(undefined)
  wrap(loginFn)
  fireEvent.change(screen.getByPlaceholderText('Usuário'), { target: { value: 'admin' } })
  fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'secret' } })
  fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
  await waitFor(() => expect(loginFn).toHaveBeenCalledWith('admin', 'secret'))
})

test('exibe toast de erro quando login falha', async () => {
  const loginFn = vi.fn().mockRejectedValue({
    response: { data: { error: { message: 'Credenciais inválidas' } } },
  })
  wrap(loginFn)
  fireEvent.change(screen.getByPlaceholderText('Usuário'), { target: { value: 'x' } })
  fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'x' } })
  fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
  await waitFor(() => expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument())
})
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
cd client && npm test -- LoginPage
```

Esperado: FAIL — `Cannot find module '../pages/LoginPage'`

- [ ] **Step 3: Criar client/src/pages/LoginPage.jsx**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setToast(err.response?.data?.error?.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl p-8 w-80 shadow-2xl">
        <h1 className="text-sky-400 text-xl font-bold text-center mb-1">◈ Streaming Hub</h1>
        <p className="text-slate-500 text-xs text-center mb-6">Acesso local</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-400 text-slate-900 font-bold py-2 rounded-lg text-sm hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>
        <p className="text-slate-600 text-xs text-center mt-4">5 tentativas / 15 min</p>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
```

- [ ] **Step 4: Rodar testes — devem passar**

```bash
cd client && npm test -- LoginPage
```

Esperado: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/LoginPage.jsx client/src/__tests__/LoginPage.test.jsx
git commit -m "feat: LoginPage com campos usuário+senha e testes"
```

---

## Task 8: CredentialsContext

**Files:**
- Create: `client/src/contexts/CredentialsContext.jsx`

- [ ] **Step 1: Criar client/src/contexts/CredentialsContext.jsx**

```jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

export const CredentialsContext = createContext(null)

export function CredentialsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [credentials, setCredentials] = useState([])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    const { data } = await api.get('/api/credentials')
    setCredentials(data)
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const activeProviderIds = credentials
    .filter((c) => c.active && c.providerId)
    .map((c) => c.providerId)

  return (
    <CredentialsContext.Provider value={{ credentials, activeProviderIds, refresh }}>
      {children}
    </CredentialsContext.Provider>
  )
}

export function useCredentials() {
  const ctx = useContext(CredentialsContext)
  if (!ctx) throw new Error('useCredentials must be used within CredentialsProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/contexts/CredentialsContext.jsx
git commit -m "feat: CredentialsContext — lista de credenciais e activeProviderIds"
```

---

## Task 9: Hooks TMDB

**Files:**
- Create: `client/src/hooks/useMovies.js`
- Create: `client/src/hooks/useSeries.js`
- Create: `client/src/hooks/useSearch.js`
- Create: `client/src/hooks/useGenres.js`
- Create: `client/src/__tests__/useMovies.test.js`

- [ ] **Step 1: Escrever teste que falha**

```js
// client/src/__tests__/useMovies.test.js
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { CredentialsContext } from '../contexts/CredentialsContext'
import useMovies from '../hooks/useMovies'
import api from '../services/api'

vi.mock('../services/api', () => ({ default: { get: vi.fn() } }))

const wrapper = ({ children }) => (
  <CredentialsContext.Provider value={{ activeProviderIds: [8] }}>
    {children}
  </CredentialsContext.Provider>
)

test('busca filmes e retorna results', async () => {
  api.get.mockResolvedValue({
    data: { results: [{ id: 1, title: 'Filme Teste' }], total_pages: 3 },
  })
  const { result } = renderHook(() => useMovies(1, ''), { wrapper })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.movies).toEqual([{ id: 1, title: 'Filme Teste' }])
  expect(result.current.totalPages).toBe(3)
  expect(api.get).toHaveBeenCalledWith('/api/stream/movies', { params: { page: 1 } })
})

test('passa genre nos params quando fornecido', async () => {
  api.get.mockResolvedValue({ data: { results: [], total_pages: 1 } })
  const { result } = renderHook(() => useMovies(1, '28'), { wrapper })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(api.get).toHaveBeenCalledWith('/api/stream/movies', { params: { page: 1, genre: '28' } })
})
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
cd client && npm test -- useMovies
```

Esperado: FAIL — `Cannot find module '../hooks/useMovies'`

- [ ] **Step 3: Criar client/src/hooks/useMovies.js**

```js
import { useState, useEffect } from 'react'
import api from '../services/api'
import { useCredentials } from '../contexts/CredentialsContext'

export default function useMovies(page = 1, genre = '') {
  const { activeProviderIds } = useCredentials()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = { page }
    if (genre) params.genre = genre
    api
      .get('/api/stream/movies', { params })
      .then(({ data }) => {
        if (!cancelled) {
          setMovies(data.results || [])
          setTotalPages(data.total_pages || 1)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, genre, activeProviderIds.join(',')])

  return { movies, loading, totalPages }
}
```

- [ ] **Step 4: Criar client/src/hooks/useSeries.js**

```js
import { useState, useEffect } from 'react'
import api from '../services/api'
import { useCredentials } from '../contexts/CredentialsContext'

export default function useSeries(page = 1, genre = '') {
  const { activeProviderIds } = useCredentials()
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = { page }
    if (genre) params.genre = genre
    api
      .get('/api/stream/series', { params })
      .then(({ data }) => {
        if (!cancelled) {
          setSeries(data.results || [])
          setTotalPages(data.total_pages || 1)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, genre, activeProviderIds.join(',')])

  return { series, loading, totalPages }
}
```

- [ ] **Step 5: Criar client/src/hooks/useSearch.js**

```js
import { useState, useEffect } from 'react'
import api from '../services/api'

export default function useSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      api
        .get('/api/stream/search', { params: { q: query } })
        .then(({ data }) => { if (!cancelled) setResults(data.results || []) })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query])

  return { results, loading }
}
```

- [ ] **Step 6: Criar client/src/hooks/useGenres.js**

```js
import { useState, useEffect } from 'react'
import api from '../services/api'

export default function useGenres() {
  const [genres, setGenres] = useState([])

  useEffect(() => {
    api.get('/api/stream/genres').then(({ data }) => setGenres(data.genres || []))
  }, [])

  return genres
}
```

- [ ] **Step 7: Rodar testes — devem passar**

```bash
cd client && npm test -- useMovies
```

Esperado: PASS (2 testes)

- [ ] **Step 8: Commit**

```bash
git add client/src/hooks/ client/src/__tests__/useMovies.test.js
git commit -m "feat: hooks useMovies, useSeries, useSearch, useGenres"
```

---

## Task 10: SettingsPage

**Files:**
- Create: `client/src/pages/SettingsPage.jsx`

- [ ] **Step 1: Criar client/src/pages/SettingsPage.jsx**

```jsx
import { useState } from 'react'
import api from '../services/api'
import { useCredentials } from '../contexts/CredentialsContext'
import Toast from '../components/Toast'
import { PROVIDER_NAMES, PROVIDERS } from '../services/providers'

export default function SettingsPage() {
  const { credentials, refresh } = useCredentials()
  const [streamer, setStreamer] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setToast({ message: 'Salvando credencial...', type: 'info' })
    try {
      const { data: credential } = await api.post('/api/credentials', {
        streamer,
        email,
        password,
        providerId: PROVIDERS[streamer]?.providerId ?? null,
      })
      setToast({ message: 'Validando login no serviço...', type: 'info' })
      await api.patch(`/api/credentials/${credential._id}/validate`)
      await refresh()
      setToast({ message: 'Credencial salva e validada!', type: 'success' })
      setStreamer('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setToast({
        message: err.response?.data?.error?.message || 'Erro ao validar. Verifique as credenciais.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/credentials/${id}`)
      await refresh()
    } catch {
      setToast({ message: 'Erro ao remover credencial.', type: 'error' })
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-slate-100 text-lg font-bold mb-6">Credenciais de Streaming</h1>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-5 mb-6">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Adicionar serviço</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={streamer}
            onChange={(e) => setStreamer(e.target.value)}
            required
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
          >
            <option value="">Selecionar serviço...</option>
            {PROVIDER_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
          >
            {loading ? 'Validando...' : 'Salvar e Validar'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {credentials.map((c) => (
          <div
            key={c._id}
            className="bg-slate-800 rounded-lg px-4 py-3 flex items-center justify-between"
          >
            <div>
              <span className="text-slate-100 font-semibold">{c.streamer}</span>
              <span className="text-slate-500 text-sm ml-3">{c.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  c.active ? 'bg-green-900 text-green-400' : 'bg-red-900/50 text-red-400'
                }`}
              >
                {c.active ? '✓ Ativo' : '✗ Inválido'}
              </span>
              <button
                onClick={() => handleDelete(c._id)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Remover"
                aria-label={`Remover ${c.streamer}`}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
        {credentials.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-6">Nenhuma credencial cadastrada.</p>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/SettingsPage.jsx
git commit -m "feat: SettingsPage — CRUD de credenciais com validação Puppeteer"
```

---

## Task 11: DashboardPage

**Files:**
- Create: `client/src/pages/DashboardPage.jsx`

- [ ] **Step 1: Criar client/src/pages/DashboardPage.jsx**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import useMovies from '../hooks/useMovies'
import useSeries from '../hooks/useSeries'
import useSearch from '../hooks/useSearch'
import useGenres from '../hooks/useGenres'
import { useCredentials } from '../contexts/CredentialsContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { credentials } = useCredentials()
  const [tab, setTab] = useState('movies')
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [page, setPage] = useState(1)

  const { movies, loading: moviesLoading } = useMovies(page, genre)
  const { series, loading: seriesLoading } = useSeries(page, genre)
  const { results: searchResults, loading: searchLoading } = useSearch(query)
  const genres = useGenres()

  const isSearching = query.trim().length > 0
  const items = isSearching ? searchResults : tab === 'movies' ? movies : series
  const loading = isSearching ? searchLoading : tab === 'movies' ? moviesLoading : seriesLoading

  const activeCredentials = credentials.filter((c) => c.active)

  function handleCardClick(item) {
    const streamer = activeCredentials[0]?.streamer ?? null
    navigate(`/player/${item.id}`, { state: { item, streamerName: streamer } })
  }

  function switchTab(next) {
    setTab(next)
    setPage(1)
  }

  return (
    <div className="p-4">
      {/* Barra de busca e filtro */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar filmes e séries..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
        />
        {!isSearching && (
          <select
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1) }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-400"
          >
            <option value="">Todos os gêneros</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Abas */}
      {!isSearching && (
        <div className="flex gap-6 mb-4 border-b border-slate-800 pb-2">
          {['movies', 'series'].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`text-sm font-medium pb-1 transition-colors ${
                tab === t
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'movies' ? 'Filmes' : 'Séries'}
            </button>
          ))}
        </div>
      )}

      {/* Aviso sem serviço ativo */}
      {activeCredentials.length === 0 && (
        <div className="mb-4 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm">
          Nenhum serviço ativo — exibindo catálogo completo.{' '}
          <button
            onClick={() => navigate('/settings')}
            className="text-sky-400 hover:underline"
          >
            Configurar serviços →
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <MovieCard
                key={item.id}
                item={item}
                streamerName={activeCredentials[0]?.streamer}
                onClick={() => handleCardClick(item)}
              />
            ))}
      </div>

      {/* Paginação */}
      {!isSearching && !loading && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-slate-400 text-sm">Página {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/DashboardPage.jsx
git commit -m "feat: DashboardPage — grid Filmes/Séries, busca, filtro por gênero, paginação"
```

---

## Task 12: PlayerPage

**Files:**
- Create: `client/src/pages/PlayerPage.jsx`
- Create: `client/src/__tests__/PlayerPage.test.jsx`

- [ ] **Step 1: Escrever o teste que falha**

```jsx
// client/src/__tests__/PlayerPage.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import PlayerPage from '../pages/PlayerPage'

const item = { id: 123, title: 'Stranger Things', overview: 'Um menino desaparece...', poster_path: '/abc.jpg' }

function wrap(state = { item, streamerName: 'Netflix' }) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated: true, logout: () => {} }}>
      <MemoryRouter
        initialEntries={[{ pathname: '/player/123', state }]}
      >
        <Routes>
          <Route path="/player/:tmdbId" element={<PlayerPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('exibe título do item', () => {
  wrap()
  expect(screen.getByText('Stranger Things')).toBeInTheDocument()
})

test('renderiza iframe com URL do Netflix', () => {
  wrap()
  const iframe = document.querySelector('iframe')
  expect(iframe).not.toBeNull()
  expect(iframe.src).toContain('netflix.com')
})

test('exibe mensagem quando sem item (refresh da página)', () => {
  wrap(null)
  expect(screen.getByText(/conteúdo não encontrado/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
cd client && npm test -- PlayerPage
```

Esperado: FAIL — `Cannot find module '../pages/PlayerPage'`

- [ ] **Step 3: Criar client/src/pages/PlayerPage.jsx**

```jsx
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { PROVIDERS } from '../services/providers'

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185'

export default function PlayerPage() {
  const { tmdbId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.item) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          ← Voltar
        </button>
        <p className="text-slate-500 text-sm mt-6">Conteúdo não encontrado.</p>
      </div>
    )
  }

  const { item, streamerName } = state
  const providerUrl = streamerName ? PROVIDERS[streamerName]?.url : null
  const posterUrl = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          ← Voltar
        </button>
        <h1 className="text-slate-100 font-bold text-lg">
          {item.title || item.name}
        </h1>
      </div>

      {providerUrl ? (
        <iframe
          src={providerUrl}
          title={streamerName}
          className="w-full rounded-xl border border-slate-700"
          style={{ height: '62vh' }}
          allow="fullscreen"
        />
      ) : (
        <div
          className="w-full rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center"
          style={{ height: '62vh' }}
        >
          <p className="text-slate-500 text-sm">Nenhum serviço ativo para reprodução.</p>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={item.title || item.name}
            className="w-20 rounded-lg flex-shrink-0 object-cover"
          />
        )}
        <div>
          {year && <p className="text-slate-400 text-sm mb-1">{year}</p>}
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-4">{item.overview}</p>
          {streamerName && (
            <span className="inline-block mt-2 bg-sky-900 text-sky-400 text-xs px-2 py-1 rounded font-medium">
              {streamerName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Rodar testes — devem passar**

```bash
cd client && npm test -- PlayerPage
```

Esperado: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/PlayerPage.jsx client/src/__tests__/PlayerPage.test.jsx
git commit -m "feat: PlayerPage — iframe do streamer com metadados TMDB"
```

---

## Task 13: App.jsx — roteamento final

**Files:**
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`

- [ ] **Step 1: Criar client/src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 2: Criar client/src/App.jsx**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CredentialsProvider } from './contexts/CredentialsContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import PlayerPage from './pages/PlayerPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CredentialsProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/player/:tmdbId" element={<PlayerPage />} />
              </Route>
            </Route>
          </Routes>
        </CredentialsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Rodar todos os testes**

```bash
cd client && npm test
```

Esperado: PASS em todos (PrivateRoute ×2, LoginPage ×3, useMovies ×2, PlayerPage ×3) = 10 testes

- [ ] **Step 4: Commit**

```bash
git add client/src/main.jsx client/src/App.jsx
git commit -m "feat: App.jsx — roteamento completo com AuthProvider e CredentialsProvider"
```

---

## Task 14: Smoke test visual (obrigatório)

- [ ] **Step 1: Garantir que MongoDB está rodando e .env está configurado**

Verificar: `PLATFORM_USER`, `PLATFORM_PASSWORD`, `TMDB_KEY`, `MONGO_URI`, `JWT_SECRET`, `SECRET_KEY` estão no `.env`.

- [ ] **Step 2: Subir backend**

```bash
npm run dev:server
```

Esperado: `Server listening on port 3001` e `MongoDB connected`

- [ ] **Step 3: Subir frontend**

```bash
npm run dev:client
```

Esperado: `Local: http://localhost:5173`

- [ ] **Step 4: Testar fluxo completo no browser**

1. Abrir `http://localhost:5173` → deve exibir LoginPage
2. Tentar login com credenciais erradas → deve exibir toast de erro
3. Fazer login correto → deve redirecionar para `/dashboard`
4. Verificar que grid carrega filmes (ou skeletons se TMDB demorar)
5. Acessar `/settings` → verificar formulário e lista vazia
6. Adicionar credencial de teste → verificar loading "Validando..."
7. Clicar num poster → deve ir para `/player/:id` com iframe
8. Clicar "← Voltar" → deve retornar ao dashboard
9. Clicar em logout → deve retornar ao login

- [ ] **Step 5: Verificar status (todos os arquivos já devem estar commitados)**

```bash
git status
```

Esperado: `nothing to commit, working tree clean`

---

## Task 15: Atualizar README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Atualizar tabela de fases no README**

Alterar as fases 2–5 de `🔲 Pendente` para `✅ Concluída`.

- [ ] **Step 2: Adicionar PLATFORM_USER na tabela de variáveis**

Adicionar linha:
```
| `PLATFORM_USER` | ✅ | Usuário de acesso à plataforma local |
```

- [ ] **Step 3: Atualizar seção "Skills aplicadas"**

Adicionar:
```
| `frontend/tailwind-patterns` | `client/src/` — classes Tailwind v3 |
| `frontend/ux-guidelines` | Dashboard, Settings, LoginPage |
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: atualizar README — fases 2-5 concluídas"
```
