const Credential = require('../models/Credential')
const validationController = require('./validation.controller')
const { NotFoundError, ValidationError } = require('../utils/errors')

exports.list = async (req, res) => {
  const credentials = await Credential.find().sort({ streamer: 1 })
  res.json(credentials)
}

exports.create = async (req, res) => {
  const { streamer, email, password, providerId } = req.body
  if (!streamer || !email || !password) {
    throw new ValidationError('streamer, email e password são obrigatórios')
  }

  const credential = new Credential({ streamer, email, providerId })
  credential.setPassword(password)
  await credential.save()

  res.status(201).json(credential)
}

exports.validate = async (req, res) => {
  const credential = await Credential.findById(req.params.id)
  if (!credential) throw new NotFoundError('Credencial')

  const { valid, cookies } = await validationController.validateCredential(
    credential.streamer,
    credential.email,
    credential.getPassword()
  )

  credential.active = valid
  credential.lastValidated = new Date()
  if (valid && cookies.length) credential.setCookies(cookies)
  await credential.save()

  res.json({ active: credential.active, lastValidated: credential.lastValidated })
}

exports.launch = async (req, res) => {
  const { streamer, url } = req.query
  if (!streamer || !url) throw new ValidationError('streamer e url são obrigatórios')
  const credential = await Credential.findOne({ streamer: new RegExp(`^${streamer}$`, 'i'), active: true })
  if (!credential) throw new NotFoundError('Credencial ativa')
  await validationController.launchWithSession(credential, url)
  res.json({ launched: true })
}

exports.toggleActive = async (req, res) => {
  const credential = await Credential.findById(req.params.id)
  if (!credential) throw new NotFoundError('Credencial')
  credential.active = !credential.active
  await credential.save()
  res.json({ active: credential.active })
}

exports.remove = async (req, res) => {
  const credential = await Credential.findByIdAndDelete(req.params.id)
  if (!credential) throw new NotFoundError('Credencial')
  res.status(204).send()
}
