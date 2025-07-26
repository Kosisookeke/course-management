const express = require('express');
const courseAllocationController = require('../controllers/courseAllocationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

// Managers can perform all CRUD operations
router.post('/', authorize('manager'), courseAllocationController.createCourseOffering);
router.put('/:id', authorize('manager'), courseAllocationController.updateCourseOffering);
router.delete('/:id', authorize('manager'), courseAllocationController.deleteCourseOffering);

// Managers and Facilitators can view offerings
// Facilitators see only their own
router.get('/', courseAllocationController.getCourseOfferings);
router.get('/:id', courseAllocationController.getCourseOfferingById);

module.exports = router;