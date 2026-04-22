import { useCredentials } from '../contexts/CredentialsContext'
import { PROVIDER_NAMES } from '../services/providers'

export default function SettingsPage() {
  const { selected, toggle } = useCredentials()

  return (
    <div className="min-h-full px-9 py-8">
      <div className="w-full max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-hub-gold text-xs flex-shrink-0">◈</span>
        <div className="flex-shrink-0">
          <h1 className="font-display text-2xl text-hub-text leading-tight">Meus Serviços</h1>
          <p className="text-hub-faint text-[9px] tracking-[2px] uppercase mt-0.5 font-medium">
            Filtrar catálogo
          </p>
        </div>
        <div className="flex-1 h-px bg-hub-border" />
      </div>

      <p className="text-hub-sub text-sm mb-8 leading-relaxed">
        Selecione os serviços que você assina para filtrar o catálogo e habilitar links diretos de streaming.
      </p>

      <div className="divide-y divide-hub-border/30">
        {PROVIDER_NAMES.map((name) => {
          const active = selected.includes(name)
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`w-full flex items-center justify-between py-4 transition-all duration-150 group ${
                active ? 'text-white' : 'text-hub-sub hover:text-hub-text'
              }`}
            >
              <span className="font-medium text-sm">{name}</span>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                active
                  ? 'bg-hub-gold'
                  : 'bg-hub-border group-hover:bg-hub-faint'
              }`}
                style={active ? { boxShadow: '0 0 8px rgba(200,169,110,0.55)' } : {}}
              />
            </button>
          )
        })}
      </div>
      </div>
    </div>
  )
}
