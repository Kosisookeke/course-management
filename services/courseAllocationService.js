const { CourseOffering, Module, Class, Cohort, Mode, User, Sequelize } = require('../models');

const createCourseOffering = async (data) => {
  // Basic validation could be added here
  return await CourseOffering.create(data);
};

const getCourseOfferings = async (filters, user) => {
  const whereClause = {};
  if (user.role === 'facilitator') {
    whereClause.facilitatorId = user.id;
  }

  // Apply filters if provided
  if (filters.trimester) whereClause.trimester = filters.trimester;
  if (filters.cohortId) whereClause.cohortId = filters.cohortId;
  if (filters.intake) whereClause.intake = filters.intake;
  if (filters.modeId) whereClause.modeId = filters.modeId;
  if (filters.facilitatorId && user.role === 'manager') whereClause.facilitatorId = filters.facilitatorId; // Allow managers to filter by facilitator

  const includeOptions = [
    { model: Module, as: 'module' },
    { model: Class, as: 'class' },
    { model: Cohort, as: 'cohort' },
    { model: Mode, as: 'mode' },
    { model: User, as: 'facilitator' }
  ];

  return await CourseOffering.findAll({
    where: whereClause,
    include: includeOptions
  });
};

const getCourseOfferingById = async (id, user) => {
  const whereClause = { id };
  if (user.role === 'facilitator') {
    whereClause.facilitatorId = user.id;
  }

  const includeOptions = [
    { model: Module, as: 'module' },
    { model: Class, as: 'class' },
    { model: Cohort, as: 'cohort' },
    { model: Mode, as: 'mode' },
    { model: User, as: 'facilitator' }
  ];

  return await CourseOffering.findOne({
    where: whereClause,
    include: includeOptions
  });
};

const updateCourseOffering = async (id, data, user) => {
  // Ensure only managers can update
  if (user.role !== 'manager') {
    throw new Error('Unauthorized');
  }

  const [updatedRowsCount] = await CourseOffering.update(data, {
    where: { id }
  });
  
  if (updatedRowsCount > 0) {
    // Fetch the updated record
    const updatedOffering = await CourseOffering.findByPk(id, {
      include: [
        { model: Module, as: 'module' },
        { model: Class, as: 'class' },
        { model: Cohort, as: 'cohort' },
        { model: Mode, as: 'mode' },
        { model: User, as: 'facilitator' }
      ]
    });
    return updatedOffering;
  }
  return null;
};

const deleteCourseOffering = async (id, user) => {
  // Ensure only managers can delete
  if (user.role !== 'manager') {
    throw new Error('Unauthorized');
  }

  const deletedRowsCount = await CourseOffering.destroy({ where: { id } });
  return deletedRowsCount > 0;
};

module.exports = {
  createCourseOffering,
  getCourseOfferings,
  getCourseOfferingById,
  updateCourseOffering,
  deleteCourseOffering,
};