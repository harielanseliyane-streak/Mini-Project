const router = require('express').Router();
const { applyToCollege, getMyApplications } = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.post('/',    authorize('student'), applyToCollege);
router.get('/my',   authorize('student'), getMyApplications);

module.exports = router;
