const router = require('express').Router();
const { sendMessage } = require('../controllers/chatbotController');
const { authenticate } = require('../middleware/auth');

// Optional auth – works for guests too, but student context added when logged in
router.post('/message', (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}, sendMessage);

module.exports = router;
