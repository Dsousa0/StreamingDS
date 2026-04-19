const { v4: uuidv4 } = require('uuid')

const requestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4()
  res.set('X-Request-ID', req.requestId)
  next()
}

const errorHandler = (err, req, res, next) => {
  const rid = req.requestId || 'sem-id'

  if (err.isOperational) {
    console.warn(`[WARN] [${rid}] ${err.code}: ${err.message}`)
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    })
  }

  console.error(`[ERROR] [${rid}]`, err)
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno. Tente novamente em alguns instantes.',
    },
  })
}

module.exports = { requestId, errorHandler }
