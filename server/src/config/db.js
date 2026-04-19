const mongoose = require('mongoose')
const env = require('./env')

const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 30_000,
    serverSelectionTimeoutMS: 5_000,
  })
  console.log('[DB] MongoDB conectado')
}

module.exports = connectDB
