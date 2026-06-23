const express = require('express');
const router = express.Router();
const { saveItem, getSavedItems, removeSavedItem } = require('../controllers/savedItemsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('student'));

router.post('/', saveItem);
router.get('/', getSavedItems);
router.delete('/:id', removeSavedItem);

module.exports = router;
