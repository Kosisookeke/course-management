const express = require('express');
const authRoutes = require('./authRoutes');
const courseAllocationRoutes = require('./courseAllocationRoutes');
const facilitatorActivityRoutes = require('./facilitatorActivityRoutes');
const fileRoutes = require('./fileRoutes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/course-allocations', courseAllocationRoutes);
router.use('/activity-logs', facilitatorActivityRoutes);
router.use('/files', fileRoutes);

module.exports = router;