const express = require('express');
const router = express.Router();
const { getAdminStats, getStudentsList, getCollegesList, broadcastNotification, deleteReview } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply admin protection to all routes below
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/students', getStudentsList);
router.get('/colleges', getCollegesList);
router.post('/broadcast', broadcastNotification);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
