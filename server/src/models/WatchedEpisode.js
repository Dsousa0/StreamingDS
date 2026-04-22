const { Schema, model } = require('mongoose')

const watchedEpisodeSchema = new Schema({
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tmdbId:   { type: String, required: true },
  episodes: { type: [String], default: [] },
}, { timestamps: true })

watchedEpisodeSchema.index({ user: 1, tmdbId: 1 }, { unique: true })

module.exports = model('WatchedEpisode', watchedEpisodeSchema)
