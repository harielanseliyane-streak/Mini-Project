const express = require('express');
const router = express.Router();
const { getEvents, getEventById, registerForEvent } = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Student only routes
router.post('/:id/register', authenticate, authorize('student'), registerForEvent);

module.exports = router;
