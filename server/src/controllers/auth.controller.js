// server/src/controllers/auth.controller.js
require('dotenv').config()
const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { UnauthorizedError, ValidationError } = require('../utils/errors')

const PLATFORM_USER = process.env.PLATFORM_USER || 'admin'
const PLATFORM_PASSWORD = process.env.PLATFORM_PASSWORD || 'admin'

exports.login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) throw new ValidationError('Usuário e senha são obrigatórios')
  if (username !== PLATFORM_USER || password !== PLATFORM_PASSWORD) {
    throw new UnauthorizedError('Credenciais inválidas')
  }
  const token = jwt.sign({ platform: true }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
  res.json({ token })
}
