const WatchedEpisode = require('../models/WatchedEpisode')

exports.getWatched = async (req, res) => {
  const { tmdbId } = req.params
  const doc = await WatchedEpisode.findOne({ user: req.user.id, tmdbId })
  res.json({ episodes: doc?.episodes ?? [] })
}

exports.toggleEpisode = async (req, res) => {
  const { tmdbId } = req.params
  const { season, episode } = req.body
  if (!season || !episode) return res.status(400).json({ error: { message: 'season e episode são obrigatórios' } })

  const key = `s${season}e${episode}`
  const doc = await WatchedEpisode.findOne({ user: req.user.id, tmdbId })

  if (!doc) {
    const created = await WatchedEpisode.create({ user: req.user.id, tmdbId, episodes: [key] })
    return res.json({ episodes: created.episodes })
  }

  const idx = doc.episodes.indexOf(key)
  if (idx === -1) doc.episodes.push(key)
  else doc.episodes.splice(idx, 1)

  await doc.save()
  res.json({ episodes: doc.episodes })
}
