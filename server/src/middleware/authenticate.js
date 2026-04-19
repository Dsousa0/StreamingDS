const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { UnauthorizedError } = require('../utils/errors')

const authenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token não fornecido'))
  }

  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, env.JWT_SECRET)
    next()
  } catch {
    next(new UnauthorizedError('Token inválido ou expirado'))
  }
}

module.exports = authenticate
