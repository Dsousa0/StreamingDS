import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setToast(err.response?.data?.error?.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-hub-muted border border-hub-border rounded-lg px-4 py-2.5 text-sm text-hub-text placeholder-hub-faint focus:outline-none focus:border-hub-gold transition-colors duration-200'

  return (
    <div className="min-h-screen bg-hub-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-display text-5xl text-hub-gold mb-3">◈</div>
          <h1 className="font-display text-2xl text-hub-text">Streaming Hub</h1>
          <p className="text-hub-faint text-xs mt-1 tracking-widest uppercase">Acesso local</p>
        </div>

        <div className="bg-hub-surface border border-hub-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              required
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hub-gold text-black font-semibold py-2.5 rounded-lg text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-hub-faint text-[11px] text-center mt-5">5 tentativas · 15 min</p>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
