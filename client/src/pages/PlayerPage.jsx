import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { PROVIDERS } from '../services/providers'
import { useCredentials } from '../contexts/CredentialsContext'
import api from '../services/api'

const TMDB_IMG_SM = 'https://image.tmdb.org/t/p/w185'
const TMDB_IMG_BG = 'https://image.tmdb.org/t/p/w1280'

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

  const title      = item.title || item.name
  const posterUrl  = item.poster_path    ? `${TMDB_IMG_SM}${item.poster_path}`   : null
  const backdropUrl = item.backdrop_path ? `${TMDB_IMG_BG}${item.backdrop_path}` : null
  const year       = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating     = item.vote_average ? item.vote_average.toFixed(1) : null
  const watchLink  = watchData?.link ?? null

  const matched = (watchData?.flatrate ?? []).filter((p) =>
    activeProviderIds.includes(p.providerId)
  )
  const providerByIdMap = Object.entries(PROVIDERS).reduce((acc, [name, cfg]) => {
    acc[cfg.providerId] = { name, ...cfg }
    return acc
  }, {})

  return (
    <div className="min-h-full bg-hub-bg">
      {backdropUrl && (
        <div className="relative w-full h-64 overflow-hidden">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-hub-bg" />
        </div>
      )}

      <div className={`px-8 pb-12 ${backdropUrl ? '-mt-16 relative' : 'pt-8'}`}>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-hub-sub hover:text-hub-gold text-sm transition-colors duration-150 mb-6 flex items-center gap-1"
        >
          ← Voltar
        </button>

        <div className="flex gap-7">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="w-32 rounded-xl flex-shrink-0 object-cover shadow-2xl"
            />
          )}

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
