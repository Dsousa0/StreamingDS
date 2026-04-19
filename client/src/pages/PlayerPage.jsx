import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { PROVIDERS } from '../services/providers'
import api from '../services/api'

const TMDB_IMG_SM = 'https://image.tmdb.org/t/p/w185'
const TMDB_IMG_BG = 'https://image.tmdb.org/t/p/w780'

export default function PlayerPage() {
  const { tmdbId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [watchData, setWatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePlayer, setActivePlayer] = useState(null) // { streamer, url }

  const item = state?.item
  const mediaType = state?.mediaType ?? (item?.title ? 'movie' : 'tv')

  useEffect(() => {
    if (!item) { setLoading(false); return }
    setWatchData(null)
    setActivePlayer(null)
    setLoading(true)
    api
      .get('/api/stream/watch-link', { params: { id: tmdbId, type: mediaType } })
      .then(({ data }) => setWatchData(data))
      .catch(() => setWatchData({ link: null, matched: [] }))
      .finally(() => setLoading(false))
  }, [tmdbId, mediaType])

  if (!item) {
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

  const title = item.title || item.name
  const posterUrl = item.poster_path ? `${TMDB_IMG_SM}${item.poster_path}` : null
  const backdropUrl = item.backdrop_path ? `${TMDB_IMG_BG}${item.backdrop_path}` : null
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null

  const matched = watchData?.matched ?? []
  const watchLink = watchData?.link ?? null

  return (
    <div className="min-h-full bg-slate-900">
      {backdropUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
        </div>
      )}

      <div className="p-4 -mt-10 relative">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-700 transition-colors flex-shrink-0"
          >
            ← Voltar
          </button>
          <h1 className="text-slate-100 font-bold text-lg leading-tight">{title}</h1>
        </div>

        <div className="flex gap-5">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="w-28 rounded-xl flex-shrink-0 object-cover shadow-lg"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {year && <span className="text-slate-400 text-sm">{year}</span>}
              {rating && (
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded font-medium">
                  ★ {rating}
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-5">
              {item.overview || 'Sem descrição disponível.'}
            </p>

            {/* Botões dos streamings que têm o título */}
            {loading ? (
              <div className="h-10 w-40 bg-slate-700 animate-pulse rounded-lg" />
            ) : matched.length > 0 ? (
              <div className="flex flex-col gap-2">
                {matched.map(({ streamer }) => {
                  const provider = PROVIDERS[streamer]
                  if (!provider) return null
                  const isActive = activePlayer?.streamer === streamer
                  return (
                    <div key={streamer} className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setActivePlayer(isActive ? null : { streamer, url: provider.url })}
                        className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                            : 'bg-sky-500 hover:bg-sky-400 text-white'
                        }`}
                      >
                        {isActive ? '✕ Fechar player' : `▶ Assistir no ${streamer}`}
                      </button>
                      <button
                        onClick={() => window.open(provider.searchUrl(title), '_blank', 'noopener,noreferrer')}
                        className="text-slate-400 hover:text-slate-200 text-xs underline transition-colors"
                      >
                        Abrir no site ↗
                      </button>
                    </div>
                  )
                })}
                {watchLink && (
                  <a href={watchLink} target="_blank" rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-400 text-xs underline transition-colors">
                    Ver onde mais assistir →
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-500 text-sm">Este título não está disponível nos seus serviços ativos.</p>
                {watchLink && (
                  <a href={watchLink} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-sky-400 hover:text-sky-300 text-sm underline transition-colors">
                    Ver onde assistir →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Player interno (iframe) */}
        {activePlayer && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">
                Player interno — {activePlayer.streamer}
                {' '}
                <span className="text-slate-600">(alguns sites bloqueiam incorporação)</span>
              </span>
              <button
                onClick={() => setActivePlayer(null)}
                className="text-slate-600 hover:text-red-400 text-xs transition-colors"
              >
                ✕ fechar
              </button>
            </div>
            <iframe
              key={activePlayer.streamer}
              src={activePlayer.url}
              title={activePlayer.streamer}
              className="w-full rounded-xl border border-slate-700"
              style={{ height: '65vh' }}
              allow="fullscreen; autoplay"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        )}
      </div>
    </div>
  )
}
