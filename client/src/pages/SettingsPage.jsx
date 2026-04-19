import { useCredentials } from '../contexts/CredentialsContext'
import { PROVIDER_NAMES } from '../services/providers'

export default function SettingsPage() {
  const { selected, toggle } = useCredentials()

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-slate-100 text-lg font-bold mb-2">Meus Serviços</h1>
      <p className="text-slate-500 text-sm mb-6">Selecione os serviços que você assina para filtrar o catálogo.</p>

      <div className="space-y-2">
        {PROVIDER_NAMES.map((name) => {
          const active = selected.includes(name)
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                active
                  ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="font-medium">{name}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${active ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                {active ? 'Ativo' : 'Inativo'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
