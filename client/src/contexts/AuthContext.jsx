import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

function parseToken(token) {
  if (!token) return { role: null, username: null }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { role: payload.role ?? null, username: payload.username ?? null }
  } catch {
    return { role: null, username: null }
  }
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [autoLogging, setAutoLogging] = useState(!localStorage.getItem('token'))

  const isAuthenticated = Boolean(token)
  const { role, username } = parseToken(token)

  // Auto-login via localhost ao abrir sem token
  useEffect(() => {
    if (token) { setAutoLogging(false); return }
    api.get('/api/auth/auto-login')
      .then(({ data }) => {
        setToken(data.token)
        localStorage.setItem('token', data.token)
      })
      .catch(() => {})
      .finally(() => setAutoLogging(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    setToken(data.token)
    localStorage.setItem('token', data.token)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem('token')
  }, [])

  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) logout()
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [logout])

  if (autoLogging) return null

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
