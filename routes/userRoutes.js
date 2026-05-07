const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMembers } = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.get('/members', authorize('admin'), getMembers);

module.exports = router;
