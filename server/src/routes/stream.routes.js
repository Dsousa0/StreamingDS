const router = require('express').Router()
const authenticate = require('../middleware/authenticate')
const streamController = require('../controllers/stream.controller')

router.use(authenticate)

router.get('/movies', streamController.getMovies)
router.get('/series', streamController.getSeries)
router.get('/search', streamController.search)
router.get('/genres', streamController.getGenres)

module.exports = router
