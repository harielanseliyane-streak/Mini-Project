const express = require('express');
const router = express.Router();
const { getInternships, getInternshipById, createInternship } = require('../controllers/internshipController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getInternships);
router.get('/:id', getInternshipById);

// Protected routes (posted by college or superadmin)
router.post('/', authenticate, authorize('college', 'admin'), createInternship);

module.exports = router;
