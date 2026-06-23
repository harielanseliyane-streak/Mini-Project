const express = require('express');
const router = express.Router({ mergeParams: true });
const { addReview } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/colleges/:id/reviews
router.post('/', authenticate, authorize('student'), addReview);

module.exports = router;
