const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { ValidationError, NotFoundError } = require('../utils/errors')

exports.list = async (req, res) => {
  const users = await User.find({}, '-passwordHash').sort({ createdAt: 1 })
  res.json(users)
}

exports.create = async (req, res) => {
  const { username, password, role = 'user' } = req.body
  if (!username || !password) throw new ValidationError('Usuário e senha são obrigatórios')
  if (!['admin', 'user'].includes(role)) throw new ValidationError('Role inválida')

  const exists = await User.findOne({ username: username.toLowerCase() })
  if (exists) throw new ValidationError('Usuário já existe')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username: username.toLowerCase(), passwordHash, role })
  res.status(201).json(user)
}

exports.remove = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new NotFoundError('Usuário')
  if (user.role === 'admin' && user.username === (process.env.PLATFORM_USER || 'admin').toLowerCase()) {
    throw new ValidationError('Não é possível remover o admin principal')
  }
  await user.deleteOne()
  res.json({ deleted: true })
}
