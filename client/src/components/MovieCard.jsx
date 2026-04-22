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
      className="relative cursor-pointer rounded-lg overflow-hidden bg-hub-card aspect-[2/3] group focus:outline-none focus:ring-1 focus:ring-hub-gold/50 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover brightness-[0.82] transition-all duration-300 group-hover:scale-[1.05] group-hover:brightness-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-hub-faint text-xs p-2 text-center leading-tight">
          {title}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] flex flex-col justify-end p-3">
        <p className="text-white text-[11px] font-semibold leading-snug">{title}</p>
        {(item.release_date || item.first_air_date) && (
          <p className="font-mono text-hub-sub text-[10px] mt-1 tracking-wider">
            {(item.release_date || item.first_air_date).slice(0, 4)}
          </p>
        )}
      </div>

      {/* Gold bottom accent — desliza no hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-hub-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

      {providerName && (
        <span className="absolute top-1.5 right-1.5 bg-hub-gold text-black text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
          {providerName}
        </span>
      )}
    </div>
  )
}
