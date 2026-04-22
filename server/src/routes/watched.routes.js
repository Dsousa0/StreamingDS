const router = require('express').Router()
const authenticate = require('../middleware/authenticate')
const watchedController = require('../controllers/watched.controller')

router.use(authenticate)

router.get('/:tmdbId', watchedController.getWatched)
router.post('/:tmdbId/toggle', watchedController.toggleEpisode)

module.exports = router
