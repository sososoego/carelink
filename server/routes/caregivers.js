const router = require('express').Router();
const { getList, getRecommended, upsertProfile } = require('../controllers/caregiverController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getList);
router.get('/recommend', authenticate, getRecommended);
router.put('/profile', authenticate, authorize('caregiver'), upsertProfile);

module.exports = router;
