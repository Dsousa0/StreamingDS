import { useState } from 'react'
import api from '../services/api'
import { useCredentials } from '../contexts/CredentialsContext'
import Toast from '../components/Toast'
import { PROVIDER_NAMES, PROVIDERS } from '../services/providers'

export default function SettingsPage() {
  const { credentials, refresh } = useCredentials()
  const [streamer, setStreamer] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setToast({ message: 'Salvando credencial...', type: 'info' })
    try {
      const { data: credential } = await api.post('/api/credentials', {
        streamer,
        email,
        password,
        providerId: PROVIDERS[streamer]?.providerId ?? null,
      })
      setToast({ message: 'Validando login no serviço...', type: 'info' })
      const { data: validation } = await api.patch(`/api/credentials/${credential._id}/validate`)
      await refresh()
      if (validation.active) {
        setToast({ message: 'Credencial salva e validada!', type: 'success' })
        setStreamer('')
        setEmail('')
        setPassword('')
      } else {
        setToast({ message: 'Credencial salva, mas o login falhou. Verifique e-mail e senha.', type: 'error' })
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.error?.message || 'Erro ao validar. Verifique as credenciais.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(id) {
    try {
      await api.patch(`/api/credentials/${id}/toggle`)
      await refresh()
    } catch {
      setToast({ message: 'Erro ao alterar status.', type: 'error' })
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/credentials/${id}`)
      await refresh()
    } catch {
      setToast({ message: 'Erro ao remover credencial.', type: 'error' })
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-slate-100 text-lg font-bold mb-6">Credenciais de Streaming</h1>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-5 mb-6">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Adicionar serviço</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={streamer}
            onChange={(e) => setStreamer(e.target.value)}
            required
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-400"
          >
            <option value="">Selecionar serviço...</option>
            {PROVIDER_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
          >
            {loading ? 'Validando...' : 'Salvar e Validar'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {credentials.map((c) => (
          <div
            key={c._id}
            className="bg-slate-800 rounded-lg px-4 py-3 flex items-center justify-between"
          >
            <div>
              <span className="text-slate-100 font-semibold">{c.streamer}</span>
              <span className="text-slate-500 text-sm ml-3">{c.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(c._id)}
                title="Clique para alternar status manualmente"
                className={`text-xs px-2 py-1 rounded font-medium transition-opacity hover:opacity-70 ${
                  c.active ? 'bg-green-900 text-green-400' : 'bg-red-900/50 text-red-400'
                }`}
              >
                {c.active ? '✓ Ativo' : '✗ Inválido'}
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Remover"
                aria-label={`Remover ${c.streamer}`}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
        {credentials.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-6">Nenhuma credencial cadastrada.</p>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
