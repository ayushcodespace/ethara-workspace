const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/login/admin', (req, res, next) => {
  req.body.role = 'admin';
  next();
}, loginUser);
router.post('/login/member', (req, res, next) => {
  req.body.role = 'member';
  next();
}, loginUser);

module.exports = router;
