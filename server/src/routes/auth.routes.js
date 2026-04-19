const router = require('express').Router()
const authController = require('../controllers/auth.controller')

router.post('/login', authController.login)
router.get('/auto-login', authController.autoLogin)

module.exports = router
