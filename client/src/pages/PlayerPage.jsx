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
