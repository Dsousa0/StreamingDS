const { ForbiddenError } = require('../utils/errors')

module.exports = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ForbiddenError('Acesso restrito a administradores'))
  next()
}
