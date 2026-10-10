const express = require('express');
const router = express.Router();
const { deleteMedia, getGlobalMedia, uploadGlobalMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getGlobalMedia)
  .post(upload.array('files', 10), uploadGlobalMedia);

router.route('/:id')
  .delete(deleteMedia);

module.exports = router;
