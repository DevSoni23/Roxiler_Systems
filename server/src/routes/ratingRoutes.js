const express = require('express');
const router = express.Router();
const { submitRating } = require('../controllers/ratingController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, ratingSchema } = require('../middleware/validators');

router.post('/', authenticate, validate(ratingSchema), submitRating);

module.exports = router;