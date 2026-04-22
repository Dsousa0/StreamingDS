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

  const fieldClass =
    'w-full bg-transparent border-b border-hub-border py-2.5 text-hub-text text-sm focus:outline-none focus:border-hub-gold transition-colors duration-200 placeholder-hub-faint/50'

  return (
    <div className="min-h-full px-9 py-8">
      <div className="w-full max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-hub-gold text-xs flex-shrink-0">◈</span>
        <div className="flex-shrink-0">
          <h1 className="font-display text-2xl text-hub-text leading-tight">Usuários</h1>
          <p className="text-hub-faint text-[9px] tracking-[2px] uppercase mt-0.5 font-medium">
            Administração
          </p>
        </div>
        <div className="flex-1 h-px bg-hub-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleCreate} className="mb-10 space-y-5">
        <p className="text-hub-faint text-[9px] tracking-[2.5px] uppercase font-semibold mb-4">Novo usuário</p>

        <div>
          <label className="block text-hub-faint text-[9px] tracking-[2px] uppercase mb-2.5 font-semibold">Usuário</label>
          <input type="text" placeholder="nome de usuário" value={username}
            onChange={(e) => setUsername(e.target.value)} className={fieldClass} required autoComplete="off" />
        </div>

        <div>
          <label className="block text-hub-faint text-[9px] tracking-[2px] uppercase mb-2.5 font-semibold">Senha</label>
          <input type="password" placeholder="senha segura" value={password}
            onChange={(e) => setPassword(e.target.value)} className={fieldClass} required autoComplete="new-password" />
        </div>

        <div>
          <label className="block text-hub-faint text-[9px] tracking-[2px] uppercase mb-2.5 font-semibold">Perfil</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full bg-transparent border-b border-hub-border py-2.5 text-hub-text text-sm focus:outline-none focus:border-hub-gold transition-colors duration-200 appearance-none cursor-pointer">
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading}
            className="bg-hub-gold text-black font-semibold text-sm px-7 py-2.5 hover:bg-hub-gold-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150">
            {loading ? 'Criando…' : 'Criar usuário →'}
          </button>
        </div>
      </form>

      {/* User list */}
      {users.length > 0 && (
        <>
          <div className="border-t border-hub-border/40 mb-5" />
          <div className="divide-y divide-hub-border/30">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-hub-text text-sm font-medium">{u.username}</span>
                  {u.role === 'admin' && (
                    <span className="text-hub-gold text-[9px] font-mono tracking-widest uppercase">
                      admin
                    </span>
                  )}
                </div>
                <button onClick={() => handleDelete(u._id)}
                  className="text-hub-faint hover:text-red-400 text-xs transition-colors duration-150 tracking-wider">
                  remover
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}
