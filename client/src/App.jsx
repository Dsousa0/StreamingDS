import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CredentialsProvider } from './contexts/CredentialsContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import PlayerPage from './pages/PlayerPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CredentialsProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/player/:tmdbId" element={<PlayerPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </CredentialsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
