const facilitatorActivityService = require('../services/facilitatorActivityService');

/**
 * @swagger
 * tags:
 *   name: Facilitator Activities
 *   description: Facilitator activity tracking and management
 */

/**
 * @swagger
 * /activity-logs:
 *   post:
 *     summary: Create a new activity log
 *     tags: [Facilitator Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - allocationId
 *               - weekNumber
 *             properties:
 *               allocationId:
 *                 type: integer
 *                 description: ID of the course allocation
 *               weekNumber:
 *                 type: integer
 *                 description: Week number for the activity log
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: boolean
 *                 description: Array of attendance records (true/false)
 *               formativeOneGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of formative assessment 1 grading
 *               formativeTwoGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of formative assessment 2 grading
 *               summativeGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of summative assessment grading
 *               courseModeration:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of course moderation
 *               intranetSync:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of intranet synchronization
 *               gradeBookStatus:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of grade book
 *     responses:
 *       201:
 *         description: Activity log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityTracker'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only facilitators can create activity logs
 */
const createActivityLog = async (req, res) => {
  try {
    const log = await facilitatorActivityService.createActivityLog(req.body, req.user.id);
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Get all activity logs
 *     tags: [Facilitator Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: allocationId
 *         schema:
 *           type: integer
 *         description: Filter by course allocation ID
 *       - in: query
 *         name: weekNumber
 *         schema:
 *           type: integer
 *         description: Filter by week number
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: integer
 *         description: Filter by facilitator ID (managers only)
 *     responses:
 *       200:
 *         description: List of activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityTracker'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getActivityLogs = async (req, res) => {
  try {
    const filters = req.query;
    const logs = await facilitatorActivityService.getActivityLogs(filters, req.user);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /activity-logs/{id}:
 *   get:
 *     summary: Get an activity log by ID
 *     tags: [Facilitator Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity log ID
 *     responses:
 *       200:
 *         description: Activity log details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityTracker'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Activity log not found
 *       500:
 *         description: Server error
 */
const getActivityLogById = async (req, res) => {
  try {
    const log = await facilitatorActivityService.getActivityLogById(req.params.id, req.user);
    if (!log) return res.status(404).json({ message: 'Activity log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /activity-logs/{id}:
 *   put:
 *     summary: Update an activity log
 *     tags: [Facilitator Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: boolean
 *                 description: Array of attendance records (true/false)
 *               formativeOneGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of formative assessment 1 grading
 *               formativeTwoGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of formative assessment 2 grading
 *               summativeGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of summative assessment grading
 *               courseModeration:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of course moderation
 *               intranetSync:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of intranet synchronization
 *               gradeBookStatus:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *                 description: Status of grade book
 *     responses:
 *       200:
 *         description: Activity log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityTracker'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only the assigned facilitator can update their activity logs
 *       404:
 *         description: Activity log not found
 */
const updateActivityLog = async (req, res) => {
  try {
    const updatedLog = await facilitatorActivityService.updateActivityLog(req.params.id, req.body, req.user);
    if (!updatedLog) return res.status(404).json({ message: 'Activity log not found' });
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /activity-logs/{id}:
 *   delete:
 *     summary: Delete an activity log
 *     tags: [Facilitator Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity log ID
 *     responses:
 *       204:
 *         description: Activity log deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only the assigned facilitator can delete their activity logs
 *       404:
 *         description: Activity log not found
 *       500:
 *         description: Server error
 */
const deleteActivityLog = async (req, res) => {
  try {
    const deleted = await facilitatorActivityService.deleteActivityLog(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ message: 'Activity log not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
};