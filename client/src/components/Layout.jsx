import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { logout, role } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const navClass = ({ isActive }) =>
    `w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors duration-150 ${
      isActive
        ? 'bg-hub-gold-dim text-hub-gold'
        : 'text-hub-faint hover:text-hub-sub'
    }`

  return (
    <div className="flex h-screen bg-hub-bg text-hub-text overflow-hidden">
      <aside className="w-[60px] bg-hub-surface border-r border-hub-border flex flex-col items-center py-5 gap-1 flex-shrink-0">
        <span className="font-display text-xl text-hub-gold mb-7 select-none">◈</span>

        <NavLink to="/dashboard" className={navClass} title="Catálogo">⊟</NavLink>
        <NavLink to="/settings"  className={navClass} title="Serviços">⚙</NavLink>
        {role === 'admin' && (
          <NavLink to="/users" className={navClass} title="Usuários">◎</NavLink>
        )}

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-hub-faint hover:text-red-500 transition-colors duration-150"
          title="Sair"
        >
          ⏻
        </button>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
