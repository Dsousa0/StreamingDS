const required = ['MONGO_URI', 'JWT_SECRET', 'TMDB_KEY', 'SECRET_KEY']
const missing = required.filter((k) => !process.env[k])

if (missing.length) {
  console.error(`[Config] Variáveis de ambiente ausentes: ${missing.join(', ')}`)
  process.exit(1)
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  TMDB_KEY: process.env.TMDB_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
}
