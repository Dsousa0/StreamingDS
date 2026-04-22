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

  const fieldClass =
    'w-full bg-transparent border-b border-hub-border py-2.5 text-hub-text text-sm focus:outline-none focus:border-hub-gold transition-colors duration-200'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-8"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #111 0%, #070707 70%)' }}
    >
      <div className="w-full max-w-[340px] animate-fade-up">

        {/* Branding */}
        <div className="mb-10">
          <span
            className="font-display text-6xl text-hub-gold block mb-5 leading-none"
            style={{ textShadow: '0 0 40px rgba(200,169,110,0.32)' }}
          >
            ◈
          </span>
          <h1 className="font-display text-[28px] text-white leading-tight mb-1">Streaming Hub</h1>
          <p className="text-hub-faint text-[10px] tracking-[3px] uppercase font-medium">Acesso privado</p>
        </div>

        <div className="border-t border-hub-border/60 mb-8" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-hub-faint text-[9px] tracking-[2.5px] uppercase mb-3 font-semibold">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={fieldClass}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-hub-faint text-[9px] tracking-[2.5px] uppercase mb-3 font-semibold">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-hub-faint text-[10px]">5 tentativas · 15 min</span>
            <button
              type="submit"
              disabled={loading}
              className="bg-hub-gold text-black text-sm font-semibold px-7 py-2.5 hover:bg-hub-gold-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {loading ? 'Aguarde' : 'Entrar →'}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
