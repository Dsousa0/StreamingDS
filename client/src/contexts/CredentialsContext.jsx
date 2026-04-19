import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

export const CredentialsContext = createContext(null)

export function CredentialsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [credentials, setCredentials] = useState([])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    const { data } = await api.get('/api/credentials')
    setCredentials(data)
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const activeProviderIds = credentials
    .filter((c) => c.active && c.providerId)
    .map((c) => c.providerId)

  return (
    <CredentialsContext.Provider value={{ credentials, activeProviderIds, refresh }}>
      {children}
    </CredentialsContext.Provider>
  )
}

export function useCredentials() {
  const ctx = useContext(CredentialsContext)
  if (!ctx) throw new Error('useCredentials must be used within CredentialsProvider')
  return ctx
}
