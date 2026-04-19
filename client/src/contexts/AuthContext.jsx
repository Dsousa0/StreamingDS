import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const isAuthenticated = Boolean(token)

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

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
