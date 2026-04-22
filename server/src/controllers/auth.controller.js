require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const env = require('../config/env')
const User = require('../models/User')
const { UnauthorizedError, ValidationError } = require('../utils/errors')

function generateToken(user) {
  return jwt.sign(
    { id: String(user._id), username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )
}

exports.seedAdmin = async () => {
  const adminUser = (process.env.PLATFORM_USER || 'admin').toLowerCase()
  const adminPass = process.env.PLATFORM_PASSWORD || 'admin'
  const exists = await User.findOne({ username: adminUser })
  if (!exists) {
    const passwordHash = await bcrypt.hash(adminPass, 10)
    await User.create({ username: adminUser, passwordHash, role: 'admin' })
    console.log(`[Auth] Admin "${adminUser}" criado no banco.`)
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) throw new ValidationError('Usuário e senha são obrigatórios')

  const user = await User.findOne({ username: username.toLowerCase() })
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Credenciais inválidas')
  }

  res.json({ token: generateToken(user), role: user.role, username: user.username })
}

exports.autoLogin = async (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || ''
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
  if (!isLocal) throw new UnauthorizedError('Auto-login disponível apenas em localhost')

  const adminUser = (process.env.PLATFORM_USER || 'admin').toLowerCase()
  const user = await User.findOne({ username: adminUser })
  if (!user) throw new UnauthorizedError('Admin não encontrado')

  res.json({ token: generateToken(user), role: user.role, username: user.username })
}
