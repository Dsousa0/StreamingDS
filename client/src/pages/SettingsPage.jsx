import { useCredentials } from '../contexts/CredentialsContext'
import { PROVIDER_NAMES } from '../services/providers'

export default function SettingsPage() {
  const { selected, toggle } = useCredentials()

  return (
    <div className="px-9 py-8 max-w-lg">
      <p className="text-hub-faint text-[10px] font-semibold tracking-[2px] uppercase mb-1">Configurações</p>
      <h1 className="font-display text-2xl text-hub-text mb-1">Meus Serviços</h1>
      <p className="text-hub-sub text-sm mb-8">Selecione os serviços que você assina para filtrar o catálogo.</p>

      <div className="space-y-2.5">
        {PROVIDER_NAMES.map((name) => {
          const active = selected.includes(name)
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border transition-colors duration-150 ${
                active
                  ? 'bg-hub-gold-dim border-hub-gold text-hub-gold'
                  : 'bg-hub-card border-hub-border text-hub-sub hover:border-hub-faint'
              }`}
            >
              <span className="font-medium text-sm">{name}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                active ? 'bg-hub-gold text-black' : 'bg-hub-muted text-hub-faint'
              }`}>
                {active ? 'Ativo' : 'Inativo'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
