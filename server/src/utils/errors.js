class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND')
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 422, 'VALIDATION_ERROR')
    this.details = details
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT')
  }
}

class ExternalServiceError extends AppError {
  constructor(message = 'Serviço externo indisponível', code = 'EXTERNAL_ERROR') {
    super(message, 502, code)
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  ExternalServiceError,
}
