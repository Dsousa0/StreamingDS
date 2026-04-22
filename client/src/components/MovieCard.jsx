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

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] flex flex-col justify-end p-2.5">
        <p className="text-white text-[11px] font-semibold leading-tight">{title}</p>
        {(item.release_date || item.first_air_date)
          ? <p className="text-hub-sub text-[10px] mt-0.5">{(item.release_date || item.first_air_date).slice(0, 4)}</p>
          : null
        }
      </div>

      {providerName && (
        <span className="absolute top-1.5 right-1.5 bg-hub-gold text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
          {providerName}
        </span>
      )}
    </div>
  )
}
