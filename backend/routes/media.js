const router = require('express').Router();
const { uploadMedia } = require('../controllers/mediaController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authenticate, upload.single('media'), uploadMedia);

module.exports = router;
