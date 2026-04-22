import { useState, useEffect } from 'react'
import api from '../services/api'
import { useCredentials } from '../contexts/CredentialsContext'

export default function useSearch(query) {
  const { activeProviderIds } = useCredentials()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const params = { q: query }
    if (activeProviderIds.length) params.providers = activeProviderIds.join('|')

    const timer = setTimeout(() => {
      api
        .get('/api/stream/search', { params })
        .then(({ data }) => { if (!cancelled) setResults(data.results || []) })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query, activeProviderIds.join(',')])

  return { results, loading }
}
