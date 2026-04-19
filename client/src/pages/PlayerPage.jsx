import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { PROVIDERS } from '../services/providers'
import api from '../services/api'

const TMDB_IMG_SM = 'https://image.tmdb.org/t/p/w185'
const TMDB_IMG_BG = 'https://image.tmdb.org/t/p/w780'

export default function PlayerPage() {
  const { tmdbId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [watchLink, setWatchLink] = useState(null)

  const item = state?.item
  const streamerName = state?.streamerName
  const mediaType = item?.title ? 'movie' : 'tv'

  // Busca o link JustWatch/TMDB do título específico
  useEffect(() => {
    if (!item) return
    api
      .get(`/api/stream/watch-link`, { params: { id: tmdbId, type: mediaType } })
      .then(({ data }) => setWatchLink(data.link))
      .catch(() => {})
  }, [tmdbId, mediaType, item])

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
  const provider = streamerName ? PROVIDERS[streamerName] : null
  const searchUrl = provider?.searchUrl(title)
  const posterUrl = item.poster_path ? `${TMDB_IMG_SM}${item.poster_path}` : null
  const backdropUrl = item.backdrop_path ? `${TMDB_IMG_BG}${item.backdrop_path}` : null
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null

  function openInStreamer() {
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-full bg-slate-900">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
        </div>
      )}

      <div className="p-4 -mt-10 relative">
        {/* Header */}
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
          {/* Poster */}
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="w-28 rounded-xl flex-shrink-0 object-cover shadow-lg"
            />
          )}

          {/* Info + ação */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {year && <span className="text-slate-400 text-sm">{year}</span>}
              {rating && (
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded font-medium">
                  ★ {rating}
                </span>
              )}
              {streamerName && (
                <span className="bg-sky-900 text-sky-400 text-xs px-2 py-0.5 rounded font-medium">
                  {streamerName}
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
              {item.overview || 'Sem descrição disponível.'}
            </p>

            {searchUrl ? (
              <div className="space-y-2">
                <button
                  onClick={openInStreamer}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  ▶ Assistir no {streamerName}
                </button>
                {watchLink && (
                  <a
                    href={watchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-slate-500 hover:text-slate-300 text-xs underline transition-colors"
                  >
                    Ver onde assistir →
                  </a>
                )}
              </div>
            ) : (
              <p className="text-slate-600 text-sm">Nenhum serviço ativo para reprodução.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
