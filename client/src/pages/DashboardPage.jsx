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
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-hub-bg to-transparent pointer-events-none" />
        </div>
      )}

      {/* TOPBAR */}
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
