const mongoose = require('mongoose')
const crypto = require('crypto')
const env = require('../config/env')

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(env.SECRET_KEY.padEnd(32).slice(0, 32))

function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

function decrypt(stored) {
  const [ivHex, tagHex, encHex] = stored.split(':')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

const credentialSchema = new mongoose.Schema(
  {
    streamer: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    passwordEncrypted: { type: String, required: true },
    providerId: { type: Number, default: null },
    active: { type: Boolean, default: false },
    lastValidated: { type: Date, default: null },
  },
  { timestamps: true }
)

credentialSchema.index({ streamer: 1 })
credentialSchema.index({ active: 1 })

credentialSchema.methods.setPassword = function (plainPassword) {
  this.passwordEncrypted = encrypt(plainPassword)
}

credentialSchema.methods.getPassword = function () {
  return decrypt(this.passwordEncrypted)
}

credentialSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordEncrypted
    return ret
  },
})

module.exports = mongoose.model('Credential', credentialSchema)
