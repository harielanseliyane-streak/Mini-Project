const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);
router.use(authorize('student'));

router.get('/profile',          ctrl.getProfile);
router.put('/profile',          ctrl.updateProfile);
router.post('/profile/photo',   upload.single('profile_photo'), ctrl.uploadPhoto);
router.get('/colleges',         ctrl.getColleges);
router.get('/colleges/:id',     ctrl.getCollegeById);
router.get('/recommendations',  ctrl.getRecommendations);

module.exports = router;
