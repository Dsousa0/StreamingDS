const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true })

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.passwordHash
    return obj
  },
})

module.exports = model('User', userSchema)
