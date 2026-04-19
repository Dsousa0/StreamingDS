const router = require('express').Router()
const authenticate = require('../middleware/authenticate')
const credentialController = require('../controllers/credential.controller')

router.use(authenticate)

router.get('/', credentialController.list)
router.post('/', credentialController.create)
router.patch('/:id/validate', credentialController.validate)
router.patch('/:id/toggle', credentialController.toggleActive)
router.post('/launch', credentialController.launch)
router.delete('/:id', credentialController.remove)

module.exports = router
