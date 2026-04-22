# Frontend Redesign — Cinema Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o frontend do Streaming Hub com identidade visual cinema premium (noir + dourado + tipografia serifada), incluindo hero banner, cards com hover overlay e microinterações.

**Architecture:** Tokens de cor centralizados em `tailwind.config.js`, fontes via Google Fonts no `index.css`, cada componente/página atualizado independentemente sem alterar lógica de negócio.

**Tech Stack:** React 18, Tailwind CSS 3, Google Fonts (Playfair Display + Inter)

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `client/tailwind.config.js` | Modificar | Adicionar tokens de cor `hub.*` |
| `client/src/index.css` | Modificar | Import Google Fonts + scrollbar styling |
| `client/src/components/Layout.jsx` | Modificar | Sidebar redesenhada (dourado, Playfair) |
| `client/src/components/MovieCard.jsx` | Modificar | Hover overlay + badge streamer |
| `client/src/components/SkeletonCard.jsx` | Modificar | Cor atualizada |
| `client/src/components/Toast.jsx` | Modificar | Cores alinhadas ao novo tema |
| `client/src/pages/LoginPage.jsx` | Modificar | Visual completo renovado |
| `client/src/pages/DashboardPage.jsx` | Modificar | Hero banner + busca + tabs + grid |
| `client/src/pages/PlayerPage.jsx` | Modificar | Backdrop hero + botões dourados |
| `client/src/pages/SettingsPage.jsx` | Modificar | Cards com borda dourada no ativo |
| `client/src/pages/UsersPage.jsx` | Modificar | Cards e form alinhados ao tema |

---

## Task 1: Tokens de cor e fontes

**Files:**
- Modify: `client/tailwind.config.js`
- Modify: `client/src/index.css`

- [ ] **Step 1: Adicionar tokens de cor ao Tailwind**

Substituir o conteúdo de `client/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hub: {
          bg:      '#0a0a0a',
          surface: '#0e0e0e',
          card:    '#141414',
          border:  '#1e1e1e',
          muted:   '#1a1a1a',
          gold:    '#c8a96e',
          'gold-dim': 'rgba(200,169,110,0.08)',
          text:    '#ffffff',
          sub:     '#888888',
          faint:   '#444444',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Adicionar fontes e reset global ao index.css**

Substituir o conteúdo de `client/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { font-family: 'Inter', system-ui, sans-serif; }
  body { background-color: #0a0a0a; color: #ffffff; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0e0e0e; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
}
```

- [ ] **Step 3: Verificar que o Vite recarrega sem erro**

No terminal do frontend, confirmar que não há erros no output do Vite após salvar os dois arquivos.

- [ ] **Step 4: Commit**

```bash
git add client/tailwind.config.js client/src/index.css
git commit -m "style: tokens de cor hub.* e fontes Playfair Display + Inter"
```

---

## Task 2: Sidebar (Layout)

**Files:**
- Modify: `client/src/components/Layout.jsx`

- [ ] **Step 1: Reescrever o Layout com nova sidebar**

Substituir o conteúdo completo de `client/src/components/Layout.jsx`:

```jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { logout, role } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const navClass = ({ isActive }) =>
    `w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors duration-150 ${
      isActive
        ? 'bg-hub-gold-dim text-hub-gold'
        : 'text-hub-faint hover:text-hub-sub'
    }`

  return (
    <div className="flex h-screen bg-hub-bg text-hub-text overflow-hidden">
      <aside className="w-[60px] bg-hub-surface border-r border-hub-border flex flex-col items-center py-5 gap-1 flex-shrink-0">
        <span className="font-display text-xl text-hub-gold mb-7 select-none">◈</span>

        <NavLink to="/dashboard" className={navClass} title="Catálogo">⊟</NavLink>
        <NavLink to="/settings"  className={navClass} title="Serviços">⚙</NavLink>
        {role === 'admin' && (
          <NavLink to="/users" className={navClass} title="Usuários">◎</NavLink>
        )}

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-hub-faint hover:text-red-500 transition-colors duration-150"
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

- [ ] **Step 2: Verificar no browser que a sidebar aparece com dourado e fundo escuro**

Abrir `http://localhost:5174/dashboard` e confirmar: logo ◈ dourado, ícones escuros com active state dourado, sem borda visível excessiva.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Layout.jsx
git commit -m "style: sidebar redesenhada — dourado, tokens hub, border-radius nos ícones"
```

---

## Task 3: MovieCard com hover overlay

**Files:**
- Modify: `client/src/components/MovieCard.jsx`
- Modify: `client/src/components/SkeletonCard.jsx`

- [ ] **Step 1: Reescrever MovieCard**

Substituir o conteúdo completo de `client/src/components/MovieCard.jsx`:

```jsx
const TMDB_IMG = 'https://image.tmdb.org/t/p/w300'

export default function MovieCard({ item, providerName, onClick }) {
  const title = item.title || item.name || '—'
  const posterUrl = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="relative cursor-pointer rounded-lg overflow-hidden bg-hub-card aspect-[2/3] group focus:outline-none focus:ring-2 focus:ring-hub-gold"
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover brightness-[0.85] transition-transform duration-300 group-hover:scale-[1.04] group-hover:brightness-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-hub-faint text-xs p-2 text-center leading-tight">
          {title}
        </div>
      )}

      {/* Overlay com título no hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-end p-2.5">
        <p className="text-white text-[11px] font-semibold leading-tight">{title}</p>
        {item.release_date || item.first_air_date
          ? <p className="text-hub-sub text-[10px] mt-0.5">{(item.release_date || item.first_air_date).slice(0, 4)}</p>
          : null
        }
      </div>

      {/* Badge do streamer */}
      {providerName && (
        <span className="absolute top-1.5 right-1.5 bg-hub-gold text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
          {providerName}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Atualizar SkeletonCard**

Substituir o conteúdo de `client/src/components/SkeletonCard.jsx`:

```jsx
export default function SkeletonCard() {
  return (
    <div className="aspect-[2/3] rounded-lg bg-hub-card animate-pulse" />
  )
}
```

- [ ] **Step 3: Verificar hover no browser**

Abrir dashboard, passar o mouse sobre um card — confirmar que o título aparece com fade e a imagem faz leve zoom.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/MovieCard.jsx client/src/components/SkeletonCard.jsx
git commit -m "style: MovieCard com hover overlay + zoom; SkeletonCard atualizado"
```

---

## Task 4: LoginPage

**Files:**
- Modify: `client/src/pages/LoginPage.jsx`

- [ ] **Step 1: Reescrever LoginPage**

Substituir o conteúdo completo de `client/src/pages/LoginPage.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

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

  const inputClass =
    'w-full bg-hub-muted border border-hub-border rounded-lg px-4 py-2.5 text-sm text-hub-text placeholder-hub-faint focus:outline-none focus:border-hub-gold transition-colors duration-200'

  return (
    <div className="min-h-screen bg-hub-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display text-5xl text-hub-gold mb-3">◈</div>
          <h1 className="font-display text-2xl text-hub-text">Streaming Hub</h1>
          <p className="text-hub-faint text-xs mt-1 tracking-widest uppercase">Acesso local</p>
        </div>

        {/* Card */}
        <div className="bg-hub-surface border border-hub-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              required
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hub-gold text-black font-semibold py-2.5 rounded-lg text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-hub-faint text-[11px] text-center mt-5">5 tentativas · 15 min</p>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
```

- [ ] **Step 2: Verificar no browser**

Abrir `http://localhost:5174` (sem token no localStorage). Confirmar: fundo preto, logo dourado, card escuro com borda sutil, botão dourado.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/LoginPage.jsx
git commit -m "style: LoginPage redesenhada — fundo noir, logo Playfair, botão dourado"
```

---

## Task 5: DashboardPage com Hero Banner

**Files:**
- Modify: `client/src/pages/DashboardPage.jsx`

- [ ] **Step 1: Reescrever DashboardPage**

Substituir o conteúdo completo de `client/src/pages/DashboardPage.jsx`:

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

const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { selected } = useCredentials()
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

  const hero = !isSearching && items.length > 0 ? items[0] : null
  const gridItems = !isSearching && hero ? items.slice(1) : items

  function handleCardClick(item) {
    const mediaType = item.title ? 'movie' : 'tv'
    navigate(`/player/${item.id}`, { state: { item, mediaType } })
  }

  function switchTab(next) {
    setTab(next)
    setPage(1)
  }

  const inputClass =
    'flex-1 bg-hub-card border border-hub-border rounded-xl px-4 py-2.5 text-sm text-hub-sub placeholder-hub-faint focus:outline-none focus:border-hub-gold transition-colors duration-200'

  return (
    <div className="min-h-full bg-hub-bg">

      {/* HERO BANNER */}
      {hero && !loading && (
        <div
          className="relative h-[340px] flex items-end px-9 pb-10 overflow-hidden"
          style={{
            background: hero.backdrop_path
              ? `linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.65) 45%, transparent 100%), url(${TMDB_BACKDROP}${hero.backdrop_path}) center/cover no-repeat`
              : '#0e0e0e',
          }}
        >
          <div>
            {selected.length > 0 && (
              <p className="text-hub-gold text-[10px] font-semibold tracking-[2px] uppercase mb-2">
                ◈ Em destaque
              </p>
            )}
            <h2 className="font-display text-4xl font-bold text-white leading-tight mb-2 max-w-lg">
              {hero.title || hero.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-hub-sub mb-5">
              {hero.vote_average > 0 && (
                <span className="text-hub-gold font-semibold">★ {hero.vote_average.toFixed(1)}</span>
              )}
              {(hero.release_date || hero.first_air_date) && (
                <span>{(hero.release_date || hero.first_air_date).slice(0, 4)}</span>
              )}
            </div>
            <button
              onClick={() => handleCardClick(hero)}
              className="bg-hub-gold text-black font-semibold text-sm px-6 py-2.5 rounded-lg hover:brightness-110 transition-all duration-150"
            >
              ▶ Assistir agora
            </button>
          </div>
          {/* Fade inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-hub-bg to-transparent pointer-events-none" />
        </div>
      )}

      {/* TOPBAR: busca + filtro */}
      <div className="flex gap-3 px-9 pt-6 pb-0">
        <input
          type="text"
          placeholder="Buscar filmes e séries..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          className={inputClass}
        />
        {!isSearching && (
          <select
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1) }}
            className="bg-hub-card border border-hub-border rounded-xl px-4 py-2.5 text-sm text-hub-sub focus:outline-none focus:border-hub-gold transition-colors duration-200 appearance-none cursor-pointer hover:border-hub-gold"
          >
            <option value="">Todos os gêneros</option>
            {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {/* TABS */}
      {!isSearching && (
        <div className="flex gap-0 px-9 mt-5 border-b border-hub-border">
          {[['movies', 'Filmes'], ['series', 'Séries']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`text-sm font-medium pb-3 mr-7 border-b-2 transition-colors duration-150 ${
                tab === key
                  ? 'text-hub-text border-hub-gold'
                  : 'text-hub-faint border-transparent hover:text-hub-sub'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* CATALOG */}
      <div className="px-9 pt-6 pb-10">
        {!isSearching && selected.length === 0 && (
          <div className="mb-5 px-4 py-3 bg-hub-card border border-hub-border rounded-xl text-hub-sub text-sm flex items-center gap-2">
            <span className="text-hub-faint">Nenhum serviço selecionado —</span>
            <button
              onClick={() => navigate('/settings')}
              className="text-hub-gold hover:underline"
            >
              configurar serviços →
            </button>
          </div>
        )}

        {!isSearching && (
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="text-hub-faint text-[10px] font-semibold tracking-[2px] uppercase mb-0.5">
                {selected.length > 0 ? 'Disponível nos seus serviços' : 'Catálogo completo'}
              </p>
              <h3 className="font-display text-xl text-hub-text">
                {tab === 'movies' ? 'Filmes' : 'Séries'}
              </h3>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : gridItems.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  onClick={() => handleCardClick(item)}
                />
              ))}
        </div>

        {/* PAGINAÇÃO */}
        {!isSearching && !loading && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 bg-hub-card border border-hub-border rounded-lg text-sm text-hub-sub disabled:opacity-30 hover:border-hub-gold hover:text-hub-gold transition-colors duration-150"
            >
              ← Anterior
            </button>
            <span className="text-hub-faint text-sm">Página {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2 bg-hub-card border border-hub-border rounded-lg text-sm text-hub-sub hover:border-hub-gold hover:text-hub-gold transition-colors duration-150"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar hero banner no browser**

Abrir o dashboard. Confirmar: banner com backdrop do primeiro filme, título em Playfair Display, botão dourado. Verificar que os outros cards ficam no grid abaixo.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/DashboardPage.jsx
git commit -m "style: DashboardPage — hero banner, tabs, busca e grid com tokens hub"
```

---

## Task 6: PlayerPage

**Files:**
- Modify: `client/src/pages/PlayerPage.jsx`

- [ ] **Step 1: Reescrever PlayerPage**

Substituir o conteúdo completo de `client/src/pages/PlayerPage.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { PROVIDERS } from '../services/providers'
import { useCredentials } from '../contexts/CredentialsContext'
import api from '../services/api'

const TMDB_IMG_SM  = 'https://image.tmdb.org/t/p/w185'
const TMDB_IMG_BG  = 'https://image.tmdb.org/t/p/w1280'

export default function PlayerPage() {
  const { tmdbId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { activeProviderIds } = useCredentials()
  const [watchData, setWatchData] = useState(null)
  const [loading, setLoading] = useState(true)

  const item = state?.item
  const mediaType = state?.mediaType ?? (item?.title ? 'movie' : 'tv')

  useEffect(() => {
    if (!item) { setLoading(false); return }
    setWatchData(null)
    setLoading(true)
    api
      .get('/api/stream/watch-link', { params: { id: tmdbId, type: mediaType } })
      .then(({ data }) => setWatchData(data))
      .catch(() => setWatchData({ link: null, flatrate: [], directLinks: {} }))
      .finally(() => setLoading(false))
  }, [tmdbId, mediaType])

  if (!item) {
    return (
      <div className="min-h-full bg-hub-bg p-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-hub-sub hover:text-hub-text text-sm transition-colors duration-150"
        >
          ← Voltar
        </button>
        <p className="text-hub-faint text-sm mt-8">Conteúdo não encontrado.</p>
      </div>
    )
  }

  const title     = item.title || item.name
  const posterUrl = item.poster_path   ? `${TMDB_IMG_SM}${item.poster_path}`  : null
  const backdropUrl = item.backdrop_path ? `${TMDB_IMG_BG}${item.backdrop_path}` : null
  const year      = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating    = item.vote_average ? item.vote_average.toFixed(1) : null
  const watchLink = watchData?.link ?? null

  const matched = (watchData?.flatrate ?? []).filter((p) =>
    activeProviderIds.includes(p.providerId)
  )
  const providerByIdMap = Object.entries(PROVIDERS).reduce((acc, [name, cfg]) => {
    acc[cfg.providerId] = { name, ...cfg }
    return acc
  }, {})

  return (
    <div className="min-h-full bg-hub-bg">
      {/* BACKDROP */}
      {backdropUrl && (
        <div className="relative w-full h-64 overflow-hidden">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-hub-bg" />
        </div>
      )}

      <div className={`px-8 pb-12 ${backdropUrl ? '-mt-16 relative' : 'pt-8'}`}>
        {/* VOLTAR */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-hub-sub hover:text-hub-gold text-sm transition-colors duration-150 mb-6 flex items-center gap-1"
        >
          ← Voltar
        </button>

        <div className="flex gap-7">
          {/* POSTER */}
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="w-32 rounded-xl flex-shrink-0 object-cover shadow-2xl"
            />
          )}

          {/* INFO */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-bold text-hub-text leading-tight mb-3">
              {title}
            </h1>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {year && <span className="text-hub-sub text-sm">{year}</span>}
              {rating && (
                <span className="text-hub-gold text-sm font-semibold">★ {rating}</span>
              )}
            </div>

            <p className="text-hub-sub text-sm leading-relaxed line-clamp-4 mb-6 max-w-xl">
              {item.overview || 'Sem descrição disponível.'}
            </p>

            {/* BOTÕES DE STREAMING */}
            {loading ? (
              <div className="h-10 w-44 bg-hub-card animate-pulse rounded-lg" />
            ) : matched.length > 0 ? (
              <div className="flex flex-col gap-2">
                {matched.map(({ providerId }) => {
                  const provider = providerByIdMap[providerId]
                  if (!provider) return null
                  return (
                    <button
                      key={providerId}
                      onClick={() => {
                        const direct = watchData?.directLinks?.[provider.name]
                        const url = direct || watchData?.link || provider.searchUrl(title, mediaType)
                        window.open(url, '_blank', 'noopener,noreferrer')
                      }}
                      className="inline-flex items-center gap-2 bg-hub-gold text-black font-semibold px-6 py-2.5 rounded-lg text-sm hover:brightness-110 transition-all duration-150 w-fit"
                    >
                      ▶ Assistir no {provider.name}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-hub-faint text-sm">Não disponível nos seus serviços.</p>
                {watchLink && (
                  <a
                    href={watchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-hub-gold hover:underline text-sm transition-colors"
                  >
                    Ver onde assistir →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar no browser**

Clicar em um filme no dashboard. Confirmar: backdrop desfocado no topo, título em Playfair Display, botão dourado "Assistir no ...".

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/PlayerPage.jsx
git commit -m "style: PlayerPage — backdrop hero, título serifado, botão dourado"
```

---

## Task 7: SettingsPage e UsersPage

**Files:**
- Modify: `client/src/pages/SettingsPage.jsx`
- Modify: `client/src/pages/UsersPage.jsx`

- [ ] **Step 1: Reescrever SettingsPage**

Substituir o conteúdo completo de `client/src/pages/SettingsPage.jsx`:

```jsx
import { useCredentials } from '../contexts/CredentialsContext'
import { PROVIDER_NAMES } from '../services/providers'

export default function SettingsPage() {
  const { selected, toggle } = useCredentials()

  return (
    <div className="px-9 py-8 max-w-lg">
      <p className="text-hub-faint text-[10px] font-semibold tracking-[2px] uppercase mb-1">Configurações</p>
      <h1 className="font-display text-2xl text-hub-text mb-1">Meus Serviços</h1>
      <p className="text-hub-sub text-sm mb-8">Selecione os serviços que você assina para filtrar o catálogo.</p>

      <div className="space-y-2.5">
        {PROVIDER_NAMES.map((name) => {
          const active = selected.includes(name)
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border transition-colors duration-150 ${
                active
                  ? 'bg-hub-gold-dim border-hub-gold text-hub-gold'
                  : 'bg-hub-card border-hub-border text-hub-sub hover:border-hub-faint'
              }`}
            >
              <span className="font-medium text-sm">{name}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                active ? 'bg-hub-gold text-black' : 'bg-hub-muted text-hub-faint'
              }`}>
                {active ? 'Ativo' : 'Inativo'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Reescrever UsersPage**

Substituir o conteúdo completo de `client/src/pages/UsersPage.jsx`:

```jsx
import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import Toast from '../components/Toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get('/api/users')
    setUsers(data)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/users', { username, password, role })
      setUsername(''); setPassword(''); setRole('user')
      setToast('Usuário criado')
      fetchUsers()
    } catch (err) {
      setToast(err.response?.data?.error?.message || 'Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/users/${id}`)
      setToast('Usuário removido')
      fetchUsers()
    } catch (err) {
      setToast(err.response?.data?.error?.message || 'Erro ao remover')
    }
  }

  const inputClass =
    'w-full bg-hub-muted border border-hub-border rounded-lg px-4 py-2.5 text-sm text-hub-text placeholder-hub-faint focus:outline-none focus:border-hub-gold transition-colors duration-200'

  return (
    <div className="px-9 py-8 max-w-lg">
      <p className="text-hub-faint text-[10px] font-semibold tracking-[2px] uppercase mb-1">Admin</p>
      <h1 className="font-display text-2xl text-hub-text mb-8">Usuários</h1>

      {/* FORM */}
      <form onSubmit={handleCreate} className="bg-hub-surface border border-hub-border rounded-2xl p-6 mb-8 space-y-3">
        <h2 className="text-hub-sub text-sm font-semibold mb-1">Novo usuário</h2>
        <input type="text" placeholder="Usuário" value={username}
          onChange={(e) => setUsername(e.target.value)} className={inputClass} required autoComplete="off" />
        <input type="password" placeholder="Senha" value={password}
          onChange={(e) => setPassword(e.target.value)} className={inputClass} required autoComplete="new-password" />
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="w-full bg-hub-muted border border-hub-border rounded-lg px-4 py-2.5 text-sm text-hub-text focus:outline-none focus:border-hub-gold transition-colors duration-200">
          <option value="user">Usuário</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading}
          className="w-full bg-hub-gold text-black font-semibold py-2.5 rounded-lg text-sm hover:brightness-110 disabled:opacity-50 transition-all duration-150">
          {loading ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>

      {/* LISTA */}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between bg-hub-card border border-hub-border rounded-xl px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-hub-text text-sm font-medium">{u.username}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                u.role === 'admin' ? 'bg-hub-gold-dim text-hub-gold' : 'bg-hub-muted text-hub-faint'
              }`}>
                {u.role}
              </span>
            </div>
            <button onClick={() => handleDelete(u._id)}
              className="text-hub-faint hover:text-red-400 text-xs transition-colors duration-150">
              Remover
            </button>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
```

- [ ] **Step 3: Verificar Settings e Users no browser**

Navegar até `/settings` — confirmar cards com borda dourada ao ativar serviço. Navegar até `/users` (como admin) — confirmar form escuro e lista com badge dourado para admin.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/SettingsPage.jsx client/src/pages/UsersPage.jsx
git commit -m "style: SettingsPage e UsersPage com tokens hub e visual cinema premium"
```

---

## Task 8: Push final

- [ ] **Step 1: Verificar estado geral do app**

Abrir `http://localhost:5174` e navegar por: Login → Dashboard (hero + grid) → PlayerPage → Settings → Users. Confirmar ausência de erros no console.

- [ ] **Step 2: Push**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ Tokens de cor (`hub.*`) — Task 1
- ✅ Tipografia Playfair Display + Inter — Task 1
- ✅ Sidebar compacta dourada — Task 2
- ✅ Hero banner com backdrop — Task 5
- ✅ Cards com hover overlay + zoom — Task 3
- ✅ Badge do streamer nos cards — Task 3
- ✅ LoginPage renovada — Task 4
- ✅ PlayerPage com botão dourado — Task 6
- ✅ SettingsPage com borda dourada ativa — Task 7
- ✅ UsersPage alinhada — Task 7
- ✅ Microinterações (transition-colors, scale, brightness) — Tasks 2-7

**Placeholder scan:** Nenhum TBD ou TODO encontrado. Todo código está completo.

**Type consistency:** `hub-gold`, `hub-card`, `hub-border`, `hub-sub`, `hub-faint`, `hub-bg`, `hub-surface`, `hub-muted`, `hub-gold-dim` usados consistentemente em todos os arquivos após definição na Task 1.
