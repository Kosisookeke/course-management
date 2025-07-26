const { ActivityTracker, CourseOffering } = require('../models');

const createActivityLog = async (data, facilitatorId) => {
  // Verify that the facilitator owns the allocation (or is manager)
  const allocation = await CourseOffering.findByPk(data.allocationId);
  if (!allocation || allocation.facilitatorId !== facilitatorId) {
    throw new Error('Unauthorized or allocation not found');
  }

  // Check if a log for this allocation and week already exists
  const existingLog = await ActivityTracker.findOne({
    where: {
      allocationId: data.allocationId,
      weekNumber: data.weekNumber
    }
  });
  if (existingLog) {
    throw new Error('Activity log for this week and allocation already exists');
  }

  return await ActivityTracker.create(data);
};

const getActivityLogs = async (filters, user) => {
  const whereClause = {};

  if (user.role === 'facilitator') {
    // Get allocations for this facilitator
    const allocations = await CourseOffering.findAll({ where: { facilitatorId: user.id }, attributes: ['id'] });
    const allocationIds = allocations.map(a => a.id);
    whereClause.allocationId = { [Sequelize.Op.in]: allocationIds };
  }

  // Apply filters if provided (e.g., by week, allocationId if manager)
  if (filters.weekNumber !== undefined) whereClause.weekNumber = filters.weekNumber;
  if (filters.allocationId && user.role === 'manager') whereClause.allocationId = filters.allocationId;

  const includeOptions = [{ model: CourseOffering, as: 'courseOffering' }];

  return await ActivityTracker.findAll({
    where: whereClause,
    include: includeOptions
  });
};

const getActivityLogById = async (id, user) => {
  const whereClause = { id };

  if (user.role === 'facilitator') {
    // Get allocations for this facilitator
    const allocations = await CourseOffering.findAll({ where: { facilitatorId: user.id }, attributes: ['id'] });
    const allocationIds = allocations.map(a => a.id);
    whereClause['$courseOffering.id$'] = { [Sequelize.Op.in]: allocationIds };
  }

  const includeOptions = [{ model: CourseOffering, as: 'courseOffering' }];

  return await ActivityTracker.findOne({
    where: whereClause,
    include: includeOptions
  });
};

const updateActivityLog = async (id, data, user) => {
  const log = await ActivityTracker.findByPk(id);
  if (!log) throw new Error('Activity log not found');

  if (user.role === 'facilitator') {
    const allocation = await CourseOffering.findByPk(log.allocationId);
    if (!allocation || allocation.facilitatorId !== user.id) {
      throw new Error('Unauthorized');
    }
  }
  // Managers can update any log

  const [updatedRowsCount, [updatedLog]] = await ActivityTracker.update(data, {
    where: { id },
    returning: true,
    plain: true
  });
  return updatedRowsCount > 0 ? updatedLog : null;
};

const deleteActivityLog = async (id, user) => {
  const log = await ActivityTracker.findByPk(id);
  if (!log) throw new Error('Activity log not found');

  if (user.role === 'facilitator') {
    const allocation = await CourseOffering.findByPk(log.allocationId);
    if (!allocation || allocation.facilitatorId !== user.id) {
      throw new Error('Unauthorized');
    }
  }
  // Managers can delete any log

  const deletedRowsCount = await ActivityTracker.destroy({ where: { id } });
  return deletedRowsCount > 0;
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
};