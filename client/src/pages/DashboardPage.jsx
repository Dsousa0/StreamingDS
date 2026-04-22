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

  const heroGenres = hero?.genre_ids
    ?.slice(0, 3)
    .map(id => genres.find(g => g.id === id)?.name)
    .filter(Boolean) ?? []

  function handleCardClick(item) {
    const mediaType = item.title ? 'movie' : 'tv'
    navigate(`/player/${item.id}`, { state: { item, mediaType } })
  }

  function switchTab(next) {
    setTab(next)
    setPage(1)
  }

  const inputClass =
    'flex-1 bg-transparent border-b border-hub-border py-2.5 text-sm text-hub-sub placeholder-hub-faint/60 focus:outline-none focus:border-hub-gold transition-colors duration-200'

  return (
    <div className="min-h-full bg-hub-bg">

      {/* HERO BANNER */}
      {hero && !loading && (
        <div
          className="relative h-[420px] flex items-end px-9 pb-12 overflow-hidden"
          style={{
            background: hero.backdrop_path
              ? `linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.72) 40%, rgba(10,10,10,0.1) 100%), url(${TMDB_BACKDROP}${hero.backdrop_path}) center/cover no-repeat`
              : '#0e0e0e',
          }}
        >
          <div className="animate-fade-up">
            {selected.length > 0 && (
              <p className="text-hub-gold text-[10px] font-semibold tracking-[2.5px] uppercase mb-3">
                ◈ Em destaque
              </p>
            )}

            {heroGenres.length > 0 && (
              <div className="flex gap-2 mb-3">
                {heroGenres.map(g => (
                  <span
                    key={g}
                    className="text-[9px] uppercase tracking-[1.5px] text-hub-sub border border-hub-border/50 px-2 py-0.5 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <h2 className="font-display text-5xl font-bold text-white leading-[1.05] mb-3 max-w-xl">
              {hero.title || hero.name}
            </h2>

            <div className="flex items-center gap-4 text-xs text-hub-sub mb-4">
              {hero.vote_average > 0 && (
                <span className="text-hub-gold font-semibold">★ {hero.vote_average.toFixed(1)}</span>
              )}
              {(hero.release_date || hero.first_air_date) && (
                <span className="font-mono tracking-wider text-hub-faint">
                  {(hero.release_date || hero.first_air_date).slice(0, 4)}
                </span>
              )}
            </div>

            {hero.overview && (
              <p className="text-hub-sub text-xs leading-relaxed max-w-md mb-5 line-clamp-2 opacity-80">
                {hero.overview}
              </p>
            )}

            <button
              onClick={() => handleCardClick(hero)}
              className="bg-hub-gold text-black font-semibold text-sm px-7 py-2.5 hover:bg-hub-gold-bright transition-colors duration-150"
            >
              ▶ Assistir agora
            </button>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-hub-bg to-transparent pointer-events-none" />
        </div>
      )}

      {/* TOPBAR */}
      <div className="flex gap-6 px-9 pt-7 pb-0">
        <input
          type="text"
          placeholder="Buscar filmes e séries…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          className={inputClass}
        />
        {!isSearching && (
          <select
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1) }}
            className="bg-transparent border-b border-hub-border py-2.5 text-sm text-hub-faint focus:outline-none focus:border-hub-gold transition-colors duration-200 appearance-none cursor-pointer hover:text-hub-sub"
          >
            <option value="">Todos os gêneros</option>
            {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {/* TABS */}
      {!isSearching && (
        <div className="flex gap-0 px-9 mt-6 border-b border-hub-border">
          {[['movies', 'Filmes'], ['series', 'Séries']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`text-sm font-medium pb-3 mr-8 border-b-2 -mb-px transition-all duration-150 ${
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
      <div className="px-9 pt-7 pb-12">

        {!isSearching && selected.length === 0 && (
          <div className="mb-6 border-l-2 border-hub-gold/30 pl-4 py-1">
            <span className="text-hub-faint text-xs">Nenhum serviço selecionado —{' '}</span>
            <button
              onClick={() => navigate('/settings')}
              className="text-hub-gold text-xs hover:underline"
            >
              configurar serviços →
            </button>
          </div>
        )}

        {!isSearching && (
          <div className="flex items-center gap-4 mb-6">
            <span className="text-hub-gold text-xs flex-shrink-0 leading-none">◈</span>
            <div className="flex-shrink-0">
              <h3 className="font-display text-xl text-hub-text leading-tight">
                {tab === 'movies' ? 'Filmes' : 'Séries'}
              </h3>
              <p className="text-hub-faint text-[9px] tracking-[2px] uppercase mt-0.5 font-medium">
                {selected.length > 0 ? 'Disponível nos seus serviços' : 'Catálogo completo'}
              </p>
            </div>
            <div className="flex-1 h-px bg-hub-border" />
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

        {/* PAGINATION */}
        {!isSearching && !loading && (
          <div className="flex justify-center items-center gap-5 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center border border-hub-border text-hub-faint text-sm disabled:opacity-20 hover:border-hub-gold hover:text-hub-gold transition-all duration-150"
            >
              ←
            </button>
            <span className="font-mono text-hub-faint text-sm tracking-widest">
              {String(page).padStart(2, '0')}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-9 h-9 flex items-center justify-center border border-hub-border text-hub-faint text-sm hover:border-hub-gold hover:text-hub-gold transition-all duration-150"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
