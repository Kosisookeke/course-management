const express = require('express');
const facilitatorActivityController = require('../controllers/facilitatorActivityController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

// Facilitators can create and update their own logs
router.post('/', authorize('facilitator'), facilitatorActivityController.createActivityLog);
router.put('/:id', authorize('facilitator'), facilitatorActivityController.updateActivityLog);
router.delete('/:id', authorize('facilitator'), facilitatorActivityController.deleteActivityLog);

// Managers and Facilitators can view logs
// Managers see all, Facilitators see their own
router.get('/', facilitatorActivityController.getActivityLogs);
router.get('/:id', facilitatorActivityController.getActivityLogById);

module.exports = router;