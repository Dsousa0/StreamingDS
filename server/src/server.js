require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')
const env = require('./config/env')

const start = async () => {
  await connectDB()

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] Rodando na porta ${env.PORT} (${env.NODE_ENV})`)
  })

  const shutdown = async (signal) => {
    console.log(`[Server] ${signal} recebido. Encerrando...`)
    server.close(async () => {
      const mongoose = require('mongoose')
      await mongoose.connection.close()
      console.log('[Server] Conexões encerradas.')
      process.exit(0)
    })
    setTimeout(() => {
      console.error('[Server] Forçando encerramento (timeout 10s)')
      process.exit(1)
    }, 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] unhandledRejection:', reason)
  })

  process.on('uncaughtException', (err) => {
    console.error('[Server] uncaughtException:', err)
    process.exit(1)
  })
}

start()
