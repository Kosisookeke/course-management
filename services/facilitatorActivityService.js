const { ActivityTracker, CourseOffering, User, Sequelize } = require('../models');
const notificationQueueService = require('./notificationQueueService');

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

  const activityLog = await ActivityTracker.create(data);

  // Trigger manager notification for late submission if applicable
  try {
    const currentDate = new Date();
    const weekStartDate = getWeekStartDate(data.weekNumber);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6); // End of week

    // If submitted after the week ended, it's a late submission
    if (currentDate > weekEndDate) {
      const managers = await User.findAll({ where: { role: 'manager' } });
      const facilitator = await User.findByPk(facilitatorId);

      for (const manager of managers) {
        await notificationQueueService.queueManagerAlert(
          manager.id,
          {
            id: facilitator.id,
            email: facilitator.email
          },
          data.allocationId,
          data.weekNumber,
          'late_submission'
        );
      }
    }
  } catch (error) {
    console.error('Error sending late submission notification:', error);
    // Don't fail the main operation if notification fails
  }

  return activityLog;
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

// Helper function to get week start date
const getWeekStartDate = (weekNumber) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysToAdd = (weekNumber - 1) * 7;
  const weekStart = new Date(startOfYear);
  weekStart.setDate(startOfYear.getDate() + daysToAdd);
  return weekStart;
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
};