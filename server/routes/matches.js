const router = require('express').Router();
const { createMatch, getMatches, updateMatchStatus } = require('../controllers/matchController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('family'), createMatch);
router.get('/', authenticate, getMatches);
router.put('/:id', authenticate, authorize('caregiver'), updateMatchStatus);

module.exports = router;
