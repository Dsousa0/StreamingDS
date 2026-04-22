import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { PROVIDERS } from '../services/providers'
import { useCredentials } from '../contexts/CredentialsContext'
import api from '../services/api'

const TMDB_IMG_SM = 'https://image.tmdb.org/t/p/w342'
const TMDB_IMG_BG = 'https://image.tmdb.org/t/p/w1280'

function fmtDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PlayerPage() {
  const { tmdbId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { activeProviderIds } = useCredentials()

  const [watchData, setWatchData]       = useState(null)
  const [watchLoading, setWatchLoading] = useState(true)
  const [seasons, setSeasons]           = useState([])
  const [seasonsLoading, setSeasonsLoading] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [episodes, setEpisodes]         = useState([])
  const [epsLoading, setEpsLoading]     = useState(false)

  const item      = state?.item
  const mediaType = state?.mediaType ?? (item?.title ? 'movie' : 'tv')
  const isTV      = mediaType === 'tv'

  // Watch providers
  useEffect(() => {
    if (!item) { setWatchLoading(false); return }
    setWatchLoading(true)
    api
      .get('/api/stream/watch-link', { params: { id: tmdbId, type: mediaType } })
      .then(({ data }) => setWatchData(data))
      .catch(() => setWatchData({ link: null, flatrate: [], directLinks: {} }))
      .finally(() => setWatchLoading(false))
  }, [tmdbId, mediaType])

  // TV seasons
  useEffect(() => {
    if (!isTV || !item) return
    setSeasonsLoading(true)
    api
      .get(`/api/stream/tv/${tmdbId}`)
      .then(({ data }) => {
        const list = (data.seasons || []).filter((s) => s.season_number > 0)
        setSeasons(list)
        if (list.length > 0) setSelectedSeason(list[0].season_number)
      })
      .finally(() => setSeasonsLoading(false))
  }, [tmdbId, isTV])

  // Episodes for selected season
  useEffect(() => {
    if (!selectedSeason) return
    setEpsLoading(true)
    setEpisodes([])
    api
      .get(`/api/stream/tv/${tmdbId}/season/${selectedSeason}`)
      .then(({ data }) => setEpisodes(data.episodes || []))
      .finally(() => setEpsLoading(false))
  }, [tmdbId, selectedSeason])

  if (!item) {
    return (
      <div className="min-h-full bg-hub-bg p-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-hub-faint hover:text-hub-gold text-xs transition-colors duration-150 tracking-widest uppercase font-medium"
        >
          ← voltar
        </button>
        <p className="text-hub-faint text-sm mt-8">Conteúdo não encontrado.</p>
      </div>
    )
  }

  const title       = item.title || item.name
  const posterUrl   = item.poster_path    ? `${TMDB_IMG_SM}${item.poster_path}`   : null
  const backdropUrl = item.backdrop_path  ? `${TMDB_IMG_BG}${item.backdrop_path}` : null
  const year        = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating      = item.vote_average ? item.vote_average.toFixed(1) : null
  const watchLink   = watchData?.link ?? null

  const matched = (watchData?.flatrate ?? []).filter((p) =>
    activeProviderIds.includes(p.providerId)
  )
  const providerByIdMap = Object.entries(PROVIDERS).reduce((acc, [name, cfg]) => {
    acc[cfg.providerId] = { name, ...cfg }
    return acc
  }, {})

  const currentSeason = seasons.find((s) => s.season_number === selectedSeason)

  return (
    <div className="min-h-full bg-hub-bg">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative w-full h-72 overflow-hidden">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-hub-bg" />
          <div className="absolute inset-0 bg-gradient-to-r from-hub-bg via-transparent to-hub-bg" />
        </div>
      )}

      <div className={`px-8 pb-10 ${backdropUrl ? '-mt-20 relative' : 'pt-8'}`}>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-hub-faint hover:text-hub-gold text-xs transition-colors duration-150 mb-8 tracking-widest uppercase font-medium"
        >
          ← voltar
        </button>

        {/* Hero info */}
        <div className="flex gap-8">
          {posterUrl && (
            <div className="flex-shrink-0">
              <img
                src={posterUrl}
                alt={title}
                className="w-44 rounded-lg object-cover"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 pt-2">
            <h1 className="font-display text-4xl font-bold text-hub-text leading-tight mb-4 max-w-xl">
              {title}
            </h1>

            <div className="flex items-center gap-4 mb-5">
              {year && <span className="font-mono text-hub-faint text-sm tracking-widest">{year}</span>}
              {year && rating && <span className="text-hub-border text-xs">·</span>}
              {rating && <span className="text-hub-gold text-sm font-semibold">★ {rating}</span>}
              {isTV && seasons.length > 0 && (
                <>
                  <span className="text-hub-border text-xs">·</span>
                  <span className="text-hub-faint text-sm">{seasons.length} temporada{seasons.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>

            <div className="border-t border-hub-border/40 mb-5" />

            <p className="text-hub-sub text-sm leading-[1.75] line-clamp-4 mb-7 max-w-lg">
              {item.overview || 'Sem descrição disponível.'}
            </p>

            {/* Streaming buttons */}
            {watchLoading ? (
              <div className="h-10 w-48 bg-hub-card animate-pulse" />
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
                      className="inline-flex items-center gap-2 bg-hub-gold text-black font-semibold px-7 py-2.5 text-sm hover:bg-hub-gold-bright transition-colors duration-150 w-fit"
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
                  <a href={watchLink} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-hub-gold hover:text-hub-gold-bright text-sm transition-colors">
                    Ver onde assistir →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── TEMPORADAS (só para séries) ─── */}
        {isTV && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-7">
              <span className="text-hub-gold text-xs flex-shrink-0">◈</span>
              <h2 className="font-display text-xl text-hub-text flex-shrink-0">Temporadas</h2>
              <div className="flex-1 h-px bg-hub-border" />
            </div>

            {/* Season selector */}
            {seasonsLoading ? (
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-12 bg-hub-card animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap mb-8">
                {seasons.map((s) => (
                  <button
                    key={s.season_number}
                    onClick={() => setSelectedSeason(s.season_number)}
                    className={`px-4 py-1.5 text-sm font-medium transition-all duration-150 border ${
                      selectedSeason === s.season_number
                        ? 'border-hub-gold text-hub-gold bg-hub-gold-dim'
                        : 'border-hub-border text-hub-faint hover:border-hub-faint hover:text-hub-sub'
                    }`}
                  >
                    T{s.season_number}
                  </button>
                ))}
              </div>
            )}

            {/* Episodes */}
            {selectedSeason && (
              <>
                {currentSeason && (
                  <p className="text-hub-faint text-[9px] tracking-[2px] uppercase font-semibold mb-5">
                    Temporada {selectedSeason} · {currentSeason.episode_count} episódio{currentSeason.episode_count !== 1 ? 's' : ''}
                  </p>
                )}

                {epsLoading ? (
                  <div className="space-y-px">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-16 bg-hub-card/50 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-hub-border/30">
                    {episodes.map((ep) => (
                      <div key={ep.episode_number} className="py-4 flex items-start gap-5 group">
                        <span className="font-mono text-hub-faint text-sm w-7 flex-shrink-0 pt-0.5 group-hover:text-hub-gold transition-colors duration-150">
                          {String(ep.episode_number).padStart(2, '0')}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-6 mb-1">
                            <span className="text-hub-text text-sm font-medium leading-snug">
                              {ep.name}
                            </span>
                            {ep.air_date && (
                              <span className="font-mono text-hub-faint text-[10px] tracking-wide flex-shrink-0">
                                {fmtDate(ep.air_date)}
                              </span>
                            )}
                          </div>
                          {ep.overview && (
                            <p className="text-hub-sub text-xs leading-relaxed line-clamp-2">
                              {ep.overview}
                            </p>
                          )}
                        </div>

                        {ep.runtime > 0 && (
                          <span className="font-mono text-hub-faint text-[10px] flex-shrink-0 pt-0.5">
                            {ep.runtime}min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
