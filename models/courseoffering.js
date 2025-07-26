'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseOffering extends Model {
    static associate(models) {
      CourseOffering.belongsTo(models.Module, { foreignKey: 'moduleId', as: 'module' });
      CourseOffering.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
      CourseOffering.belongsTo(models.Cohort, { foreignKey: 'cohortId', as: 'cohort' });
      CourseOffering.belongsTo(models.Mode, { foreignKey: 'modeId', as: 'mode' });
      CourseOffering.belongsTo(models.User, { foreignKey: 'facilitatorId', as: 'facilitator' });
      CourseOffering.hasMany(models.ActivityTracker, { foreignKey: 'allocationId', as: 'activityLogs' });
    }
  }
  CourseOffering.init({
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Modules',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    trimester: {
      type: DataTypes.ENUM('T1', 'T2', 'T3'),
      allowNull: false
    },
    cohortId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cohorts',
        key: 'id'
      }
    },
    intake: {
      type: DataTypes.ENUM('HT1', 'HT2', 'FT'),
      allowNull: false
    },
    modeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Modes',
        key: 'id'
      }
    },
    facilitatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'CourseOffering',
  });
  return CourseOffering;
};