const axios = require('axios')
const env = require('../config/env')
const { ExternalServiceError } = require('../utils/errors')
const { launchBrowser, UA } = require('../utils/browser')

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
  const { q, page = 1, providers } = req.query
  const data = await tmdbGet('/search/multi', { query: q, page })

  if (!providers) return res.json(data)

  const providerIds = providers.split('|').map(Number)
  const items = (data.results || []).filter(
    (r) => r.media_type === 'movie' || r.media_type === 'tv'
  )

  const filtered = (
    await Promise.all(
      items.map(async (item) => {
        try {
          const path =
            item.media_type === 'tv'
              ? `/tv/${item.id}/watch/providers`
              : `/movie/${item.id}/watch/providers`
          const pData = await tmdbGet(path, { watch_region: 'BR' })
          const flatrate = (pData.results?.BR?.flatrate ?? []).map((p) => p.provider_id)
          return flatrate.some((id) => providerIds.includes(id)) ? item : null
        } catch {
          return null
        }
      })
    )
  ).filter(Boolean)

  res.json({ ...data, results: filtered })
}

// Mapeamento de nome do provider → domínios reconhecidos na URL
const PROVIDER_DOMAINS = {
  'Netflix':      ['netflix.com'],
  'Prime Video':  ['primevideo.com', 'amazon.com.br/video', 'amazon.com/video'],
  'HBO Max':      ['play.max.com', 'play.hbomax.com'],
  'Disney+':      ['disneyplus.com'],
  'Crunchyroll':  ['crunchyroll.com'],
}

const watchLinkCache = new Map()
const CACHE_TTL = 30 * 60 * 1000

async function extractDirectLinks(tmdbId, mediaType) {
  const key = `${tmdbId}_${mediaType}`
  const cached = watchLinkCache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const watchUrl = `https://www.themoviedb.org/${mediaType}/${tmdbId}/watch?locale=BR`
  let browser
  try {
    browser = await launchBrowser()
    const page = await browser.newPage()
    await page.setUserAgent(UA)
    await page.goto(watchUrl, { waitUntil: 'networkidle2', timeout: 20_000 })

    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map((a) => a.href)
    )

    const result = {}
    for (const [name, domains] of Object.entries(PROVIDER_DOMAINS)) {
      const match = hrefs.find((h) => domains.some((d) => h.includes(d)))
      if (match) result[name] = match
    }

    watchLinkCache.set(key, { data: result, ts: Date.now() })
    return result
  } catch {
    return {}
  } finally {
    await browser?.close()
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

exports.getTVDetails = async (req, res) => {
  const data = await tmdbGet(`/tv/${req.params.id}`)
  res.json(data)
}

exports.getSeason = async (req, res) => {
  const { id, n } = req.params
  const data = await tmdbGet(`/tv/${id}/season/${n}`)
  res.json(data)
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
