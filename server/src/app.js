require('dotenv').config()
require('express-async-errors')

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { rateLimit } = require('express-rate-limit')
const morgan = require('morgan')

const env = require('./config/env')
const { requestId, errorHandler } = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth.routes')
const streamRoutes = require('./routes/stream.routes')
const credentialRoutes = require('./routes/credential.routes')

const app = express()

// 1. Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  })
)

// 2. CORS
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = env.ALLOWED_ORIGINS.split(',')
      if (!origin || allowed.includes(origin)) return cb(null, true)
      cb(new Error('Origem não permitida pelo CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  })
)

// 3. Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas. Tente em 15 minutos.' } },
})
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const ip = req.ip || ''
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
  },
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Limite de requisições atingido.' } },
})

app.use('/api/auth', authLimiter)
app.use(globalLimiter)

// 4. Request logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// 5. Request ID
app.use(requestId)

// 6. Body parser
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// 7. Routes
app.use('/api/auth', authRoutes)
app.use('/api/stream', streamRoutes)
app.use('/api/credentials', credentialRoutes)

// 8. 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada' } })
})

// 9. Error handler (must be last)
app.use(errorHandler)

module.exports = app
