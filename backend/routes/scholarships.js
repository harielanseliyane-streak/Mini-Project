const express = require('express');
const router = express.Router();
const { getScholarships, getScholarshipById } = require('../controllers/scholarshipController');

router.get('/', getScholarships);
router.get('/:id', getScholarshipById);

module.exports = router;
