const axios = require('axios')
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

exports.getMovies = async (req, res) => {
  const { page = 1, genre, providers } = req.query
  const params = { page }
  if (providers) params.with_watch_providers = providers
  if (genre) params.with_genres = genre
  const data = await tmdbGet('/discover/movie', { ...params, watch_region: 'BR' })
  res.json(data)
}

exports.getSeries = async (req, res) => {
  const { page = 1, genre, providers } = req.query
  const params = { page }
  if (providers) params.with_watch_providers = providers
  if (genre) params.with_genres = genre
  const data = await tmdbGet('/discover/tv', { ...params, watch_region: 'BR' })
  res.json(data)
}

exports.search = async (req, res) => {
  const { q, page = 1 } = req.query
  const data = await tmdbGet('/search/multi', { query: q, page })
  res.json(data)
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const MAX_RE = new RegExp(`https://play\\.(hbomax|max)\\.com/(movie|show)/${UUID_RE.source}`, 'i')

async function extractDirectLinks(tmdbId, mediaType) {
  const watchPageUrl = `https://www.themoviedb.org/${mediaType}/${tmdbId}/watch?locale=BR`
  try {
    const { data: html } = await axios.get(watchPageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
      timeout: 8_000,
    })
    const links = {}
    const maxMatch = html.match(MAX_RE)
    if (maxMatch) links['HBO Max'] = maxMatch[0]
    return links
  } catch {
    return {}
  }
}

exports.getWatchLink = async (req, res) => {
  const { id, type = 'movie' } = req.query
  const path = type === 'tv' ? `/tv/${id}/watch/providers` : `/movie/${id}/watch/providers`
  const data = await tmdbGet(path, { watch_region: 'BR' })
  const br = data.results?.BR ?? {}
  const link = br.link ?? null
  const flatrate = (br.flatrate ?? []).map((p) => ({
    providerId: p.provider_id,
    name: p.provider_name,
  }))
  const directLinks = await extractDirectLinks(id, type)
  res.json({ link, flatrate, directLinks })
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
