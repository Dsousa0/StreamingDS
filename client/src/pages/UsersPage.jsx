import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import Toast from '../components/Toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get('/api/users')
    setUsers(data)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/users', { username, password, role })
      setUsername(''); setPassword(''); setRole('user')
      setToast('Usuário criado')
      fetchUsers()
    } catch (err) {
      setToast(err.response?.data?.error?.message || 'Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/users/${id}`)
      setToast('Usuário removido')
      fetchUsers()
    } catch (err) {
      setToast(err.response?.data?.error?.message || 'Erro ao remover')
    }
  }

  const inputClass =
    'w-full bg-hub-muted border border-hub-border rounded-lg px-4 py-2.5 text-sm text-hub-text placeholder-hub-faint focus:outline-none focus:border-hub-gold transition-colors duration-200'

  return (
    <div className="px-9 py-8 max-w-lg">
      <p className="text-hub-faint text-[10px] font-semibold tracking-[2px] uppercase mb-1">Admin</p>
      <h1 className="font-display text-2xl text-hub-text mb-8">Usuários</h1>

      <form onSubmit={handleCreate} className="bg-hub-surface border border-hub-border rounded-2xl p-6 mb-8 space-y-3">
        <h2 className="text-hub-sub text-sm font-semibold mb-1">Novo usuário</h2>
        <input type="text" placeholder="Usuário" value={username}
          onChange={(e) => setUsername(e.target.value)} className={inputClass} required autoComplete="off" />
        <input type="password" placeholder="Senha" value={password}
          onChange={(e) => setPassword(e.target.value)} className={inputClass} required autoComplete="new-password" />
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="w-full bg-hub-muted border border-hub-border rounded-lg px-4 py-2.5 text-sm text-hub-text focus:outline-none focus:border-hub-gold transition-colors duration-200">
          <option value="user">Usuário</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading}
          className="w-full bg-hub-gold text-black font-semibold py-2.5 rounded-lg text-sm hover:brightness-110 disabled:opacity-50 transition-all duration-150">
          {loading ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between bg-hub-card border border-hub-border rounded-xl px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-hub-text text-sm font-medium">{u.username}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                u.role === 'admin' ? 'bg-hub-gold-dim text-hub-gold' : 'bg-hub-muted text-hub-faint'
              }`}>
                {u.role}
              </span>
            </div>
            <button onClick={() => handleDelete(u._id)}
              className="text-hub-faint hover:text-red-400 text-xs transition-colors duration-150">
              Remover
            </button>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
