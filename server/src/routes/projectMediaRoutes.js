const express = require('express');
const router = express.Router({ mergeParams: true }); // Important to get :id from projectRoutes
const { uploadMedia, getProjectMedia, deleteMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// These routes are mounted at /api/projects/:id/media
router.route('/')
  .post(upload.array('files', 10), uploadMedia)
  .get(getProjectMedia);

// This route is mounted at /api/media
// We'll handle this in app.js separately as it doesn't need project ID
// Actually, let's keep it clean. In projectRoutes, we use this router for /:id/media.
// But delete is /api/media/:id. Let's create a separate router for general media endpoints.

module.exports = router;
