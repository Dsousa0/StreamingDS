const router = require('express').Router()
const authenticate = require('../middleware/authenticate')
const streamController = require('../controllers/stream.controller')

router.use(authenticate)

router.get('/movies', streamController.getMovies)
router.get('/series', streamController.getSeries)
router.get('/search', streamController.search)
router.get('/genres', streamController.getGenres)
router.get('/watch-link', streamController.getWatchLink)
router.get('/tv/:id/season/:n', streamController.getSeason)
router.get('/tv/:id', streamController.getTVDetails)

module.exports = router
