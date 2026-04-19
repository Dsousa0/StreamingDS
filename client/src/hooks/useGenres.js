import { useState, useEffect } from 'react'
import api from '../services/api'

export default function useGenres() {
  const [genres, setGenres] = useState([])

  useEffect(() => {
    api.get('/api/stream/genres').then(({ data }) => setGenres(data.genres || []))
  }, [])

  return genres
}
