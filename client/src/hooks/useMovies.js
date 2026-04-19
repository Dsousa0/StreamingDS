import { useState, useEffect } from 'react'
import api from '../services/api'
import { useCredentials } from '../contexts/CredentialsContext'

export default function useMovies(page = 1, genre = '') {
  const { activeProviderIds } = useCredentials()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = { page }
    if (genre) params.genre = genre
    if (activeProviderIds.length) params.providers = activeProviderIds.join('|')
    api
      .get('/api/stream/movies', { params })
      .then(({ data }) => {
        if (!cancelled) {
          setMovies(data.results || [])
          setTotalPages(data.total_pages || 1)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, genre, activeProviderIds.join(',')])

  return { movies, loading, totalPages }
}
