const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { UnauthorizedError, ValidationError } = require('../utils/errors')

const PLATFORM_PASSWORD = process.env.PLATFORM_PASSWORD || 'admin'

exports.login = async (req, res) => {
  const { password } = req.body
  if (!password) throw new ValidationError('Senha é obrigatória')
  if (password !== PLATFORM_PASSWORD) throw new UnauthorizedError('Senha incorreta')

  const token = jwt.sign({ platform: true }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
  res.json({ token })
}
