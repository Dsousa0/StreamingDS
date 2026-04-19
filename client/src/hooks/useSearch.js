import { useState, useEffect } from 'react'
import api from '../services/api'

export default function useSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      api
        .get('/api/stream/search', { params: { q: query } })
        .then(({ data }) => { if (!cancelled) setResults(data.results || []) })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query])

  return { results, loading }
}
