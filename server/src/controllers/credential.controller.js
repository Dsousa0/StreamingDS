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

  const isValid = await validationController.validateCredential(
    credential.streamer,
    credential.email,
    credential.getPassword()
  )

  credential.active = isValid
  credential.lastValidated = new Date()
  await credential.save()

  res.json({ active: credential.active, lastValidated: credential.lastValidated })
}

exports.remove = async (req, res) => {
  const credential = await Credential.findByIdAndDelete(req.params.id)
  if (!credential) throw new NotFoundError('Credencial')
  res.status(204).send()
}
