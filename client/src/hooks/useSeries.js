import { useState, useEffect } from 'react'
import api from '../services/api'
import { useCredentials } from '../contexts/CredentialsContext'

export default function useSeries(page = 1, genre = '') {
  const { activeProviderIds } = useCredentials()
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = { page }
    if (genre) params.genre = genre
    if (activeProviderIds.length) params.providers = activeProviderIds.join('|')
    api
      .get('/api/stream/series', { params })
      .then(({ data }) => {
        if (!cancelled) {
          setSeries(data.results || [])
          setTotalPages(data.total_pages || 1)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, genre, activeProviderIds.join(',')])

  return { series, loading, totalPages }
}
