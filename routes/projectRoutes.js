const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  addMemberToProject,
} = require('../controllers/projectController');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', authorize('admin'), createProject);
router.post('/:id/members', authorize('admin'), addMemberToProject);

module.exports = router;
