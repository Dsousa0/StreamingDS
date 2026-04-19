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
