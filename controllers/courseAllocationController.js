const courseAllocationService = require('../services/courseAllocationService');

const createCourseOffering = async (req, res) => {
  try {
    const offering = await courseAllocationService.createCourseOffering(req.body);
    res.status(201).json(offering);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCourseOfferings = async (req, res) => {
  try {
    const filters = req.query; // Filters like trimester, cohort, etc.
    const offerings = await courseAllocationService.getCourseOfferings(filters, req.user);
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseOfferingById = async (req, res) => {
  try {
    const offering = await courseAllocationService.getCourseOfferingById(req.params.id, req.user);
    if (!offering) return res.status(404).json({ message: 'Course offering not found' });
    res.json(offering);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourseOffering = async (req, res) => {
  try {
    const updatedOffering = await courseAllocationService.updateCourseOffering(req.params.id, req.body, req.user);
    if (!updatedOffering) return res.status(404).json({ message: 'Course offering not found' });
    res.json(updatedOffering);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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