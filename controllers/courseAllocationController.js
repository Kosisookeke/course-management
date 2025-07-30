const courseAllocationService = require('../services/courseAllocationService');

/**
 * @swagger
 * tags:
 *   name: Course Allocations
 *   description: Course offering and allocation management
 */

/**
 * @swagger
 * /course-allocations:
 *   post:
 *     summary: Create a new course offering
 *     tags: [Course Allocations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleId
 *               - classId
 *               - trimester
 *               - cohortId
 *               - intake
 *               - modeId
 *             properties:
 *               moduleId:
 *                 type: integer
 *                 description: ID of the module
 *               classId:
 *                 type: integer
 *                 description: ID of the class
 *               trimester:
 *                 type: string
 *                 enum: [T1, T2, T3]
 *                 description: Trimester (T1, T2, T3)
 *               cohortId:
 *                 type: integer
 *                 description: ID of the cohort
 *               intake:
 *                 type: string
 *                 enum: [HT1, HT2, FT]
 *                 description: Intake type (HT1, HT2, FT)
 *               modeId:
 *                 type: integer
 *                 description: ID of the delivery mode
 *               facilitatorId:
 *                 type: integer
 *                 description: ID of the assigned facilitator (optional)
 *     responses:
 *       201:
 *         description: Course offering created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseOffering'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only managers can create course offerings
 */
const createCourseOffering = async (req, res) => {
  try {
    const offering = await courseAllocationService.createCourseOffering(req.body);
    res.status(201).json(offering);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /course-allocations:
 *   get:
 *     summary: Get all course offerings
 *     tags: [Course Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trimester
 *         schema:
 *           type: string
 *           enum: [T1, T2, T3]
 *         description: Filter by trimester
 *       - in: query
 *         name: cohortId
 *         schema:
 *           type: integer
 *         description: Filter by cohort ID
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: integer
 *         description: Filter by module ID
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: integer
 *         description: Filter by facilitator ID
 *     responses:
 *       200:
 *         description: List of course offerings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseOffering'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getCourseOfferings = async (req, res) => {
  try {
    const filters = req.query; // Filters like trimester, cohort, etc.
    const offerings = await courseAllocationService.getCourseOfferings(filters, req.user);
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /course-allocations/{id}:
 *   get:
 *     summary: Get a course offering by ID
 *     tags: [Course Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course offering ID
 *     responses:
 *       200:
 *         description: Course offering details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseOffering'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course offering not found
 *       500:
 *         description: Server error
 */
const getCourseOfferingById = async (req, res) => {
  try {
    const offering = await courseAllocationService.getCourseOfferingById(req.params.id, req.user);
    if (!offering) return res.status(404).json({ message: 'Course offering not found' });
    res.json(offering);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /course-allocations/{id}:
 *   put:
 *     summary: Update a course offering
 *     tags: [Course Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course offering ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleId:
 *                 type: integer
 *                 description: ID of the module
 *               classId:
 *                 type: integer
 *                 description: ID of the class
 *               trimester:
 *                 type: string
 *                 enum: [T1, T2, T3]
 *                 description: Trimester (T1, T2, T3)
 *               cohortId:
 *                 type: integer
 *                 description: ID of the cohort
 *               intake:
 *                 type: string
 *                 enum: [HT1, HT2, FT]
 *                 description: Intake type (HT1, HT2, FT)
 *               modeId:
 *                 type: integer
 *                 description: ID of the delivery mode
 *               facilitatorId:
 *                 type: integer
 *                 description: ID of the assigned facilitator
 *     responses:
 *       200:
 *         description: Course offering updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseOffering'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only managers can update course offerings
 *       404:
 *         description: Course offering not found
 */
const updateCourseOffering = async (req, res) => {
  try {
    const updatedOffering = await courseAllocationService.updateCourseOffering(req.params.id, req.body, req.user);
    if (!updatedOffering) return res.status(404).json({ message: 'Course offering not found' });
    res.json(updatedOffering);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /course-allocations/{id}:
 *   delete:
 *     summary: Delete a course offering
 *     tags: [Course Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course offering ID
 *     responses:
 *       204:
 *         description: Course offering deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only managers can delete course offerings
 *       404:
 *         description: Course offering not found
 *       500:
 *         description: Server error
 */
const deleteCourseOffering = async (req, res) => {
  try {
    const deleted = await courseAllocationService.deleteCourseOffering(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ message: 'Course offering not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourseOffering,
  getCourseOfferings,
  getCourseOfferingById,
  updateCourseOffering,
  deleteCourseOffering,
};