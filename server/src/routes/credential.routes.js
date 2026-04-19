const router = require('express').Router()
const authenticate = require('../middleware/authenticate')
const credentialController = require('../controllers/credential.controller')

router.use(authenticate)

router.get('/', credentialController.list)
router.post('/', credentialController.create)
router.patch('/:id/validate', credentialController.validate)
router.delete('/:id', credentialController.remove)

module.exports = router
