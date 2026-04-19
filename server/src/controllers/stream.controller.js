const axios = require('axios')
const Credential = require('../models/Credential')
const env = require('../config/env')
const { ExternalServiceError } = require('../utils/errors')

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function tmdbGet(path, params = {}) {
  try {
    const { data } = await axios.get(`${TMDB_BASE}${path}`, {
      params: { api_key: env.TMDB_KEY, language: 'pt-BR', ...params },
      timeout: 8_000,
    })
    return data
  } catch (err) {
    if (err.code === 'ECONNABORTED') throw new ExternalServiceError('TMDB timeout', 'TMDB_TIMEOUT')
    throw new ExternalServiceError('Erro ao consultar TMDB')
  }
}

async function getActiveProviderIds() {
  const active = await Credential.find({ active: true }, 'providerId')
  return active.map((c) => c.providerId).filter(Boolean)
}

exports.getMovies = async (req, res) => {
  const { page = 1, genre } = req.query
  const providerIds = await getActiveProviderIds()

  const params = { page }
  if (providerIds.length) params.with_watch_providers = providerIds.join('|')
  if (genre) params.with_genres = genre

  const data = await tmdbGet('/discover/movie', { ...params, watch_region: 'BR' })
  res.json(data)
}

exports.getSeries = async (req, res) => {
  const { page = 1, genre } = req.query
  const providerIds = await getActiveProviderIds()

  const params = { page }
  if (providerIds.length) params.with_watch_providers = providerIds.join('|')
  if (genre) params.with_genres = genre

  const data = await tmdbGet('/discover/tv', { ...params, watch_region: 'BR' })
  res.json(data)
}

exports.search = async (req, res) => {
  const { q, page = 1 } = req.query
  const data = await tmdbGet('/search/multi', { query: q, page })
  res.json(data)
}

exports.getWatchLink = async (req, res) => {
  const { id, type = 'movie' } = req.query
  const path = type === 'tv' ? `/tv/${id}/watch/providers` : `/movie/${id}/watch/providers`
  const data = await tmdbGet(path, { watch_region: 'BR' })
  const link = data.results?.BR?.link ?? null
  res.json({ link })
}

exports.getGenres = async (req, res) => {
  const [movies, tv] = await Promise.all([
    tmdbGet('/genre/movie/list'),
    tmdbGet('/genre/tv/list'),
  ])
  const combined = [...movies.genres, ...tv.genres]
  const unique = Array.from(new Map(combined.map((g) => [g.id, g])).values())
  res.json({ genres: unique })
}
