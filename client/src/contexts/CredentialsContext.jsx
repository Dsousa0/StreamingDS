import { createContext, useContext, useState } from 'react'
import { PROVIDERS } from '../services/providers'

export const CredentialsContext = createContext(null)

function loadSelected() {
  try { return JSON.parse(localStorage.getItem('selectedStreamers') ?? '[]') }
  catch { return [] }
}

export function CredentialsProvider({ children }) {
  const [selected, setSelected] = useState(loadSelected)

  const toggle = (name) => {
    setSelected((prev) => {
      const next = prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
      localStorage.setItem('selectedStreamers', JSON.stringify(next))
      return next
    })
  }

  const activeProviderIds = selected
    .map((name) => PROVIDERS[name]?.providerId)
    .filter(Boolean)

  return (
    <CredentialsContext.Provider value={{ selected, toggle, activeProviderIds }}>
      {children}
    </CredentialsContext.Provider>
  )
}

export function useCredentials() {
  const ctx = useContext(CredentialsContext)
  if (!ctx) throw new Error('useCredentials must be used within CredentialsProvider')
  return ctx
}
