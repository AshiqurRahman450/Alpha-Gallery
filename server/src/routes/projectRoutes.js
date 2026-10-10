const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);

// Note: Media routes will be nested or added separately under /:id/media
const projectMediaRoutes = require('./projectMediaRoutes');
router.use('/:id/media', projectMediaRoutes);

module.exports = router;
