const router = require('express').Router()
const authenticate = require('../middleware/authenticate')
const requireAdmin = require('../middleware/requireAdmin')
const userController = require('../controllers/user.controller')

router.use(authenticate, requireAdmin)

router.get('/', userController.list)
router.post('/', userController.create)
router.delete('/:id', userController.remove)

module.exports = router
