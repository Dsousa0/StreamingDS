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
