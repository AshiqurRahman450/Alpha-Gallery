const express = require('express');
const router = express.Router();
const {
  createBdm,
  getBdms,
  getBdmById,
  updateBdm,
  updateBdmStatus,
  resetBdmPassword,
} = require('../controllers/bdmController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.route('/')
  .post(createBdm)
  .get(getBdms);

router.route('/:id')
  .get(getBdmById)
  .patch(updateBdm);

router.patch('/:id/status', updateBdmStatus);
router.post('/:id/reset-password', resetBdmPassword);

module.exports = router;
