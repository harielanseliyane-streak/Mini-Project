const express = require('express');
const router = express.Router();
const { saveQuizResult, getMyQuizResults } = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes (students only)
router.post('/result', authenticate, authorize('student'), saveQuizResult);
router.get('/my', authenticate, authorize('student'), getMyQuizResults);

module.exports = router;
