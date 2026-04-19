import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const iconClass = ({ isActive }) =>
    isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300 transition-colors'

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <aside className="w-14 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 gap-5 flex-shrink-0">
        <span className="text-sky-400 text-lg font-bold select-none">◈</span>
        <NavLink to="/dashboard" className={iconClass} title="Dashboard">
          <span className="text-xl">⊟</span>
        </NavLink>
        <NavLink to="/settings" className={iconClass} title="Configurações">
          <span className="text-xl">⚙</span>
        </NavLink>
        <div className="flex-1" />
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 transition-colors text-xl"
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
