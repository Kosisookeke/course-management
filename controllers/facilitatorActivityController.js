const facilitatorActivityService = require('../services/facilitatorActivityService');

const createActivityLog = async (req, res) => {
  try {
    const log = await facilitatorActivityService.createActivityLog(req.body, req.user.id);
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const filters = req.query;
    const logs = await facilitatorActivityService.getActivityLogs(filters, req.user);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActivityLogById = async (req, res) => {
  try {
    const log = await facilitatorActivityService.getActivityLogById(req.params.id, req.user);
    if (!log) return res.status(404).json({ message: 'Activity log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateActivityLog = async (req, res) => {
  try {
    const updatedLog = await facilitatorActivityService.updateActivityLog(req.params.id, req.body, req.user);
    if (!updatedLog) return res.status(404).json({ message: 'Activity log not found' });
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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