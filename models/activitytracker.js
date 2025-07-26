'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActivityTracker extends Model {
    static associate(models) {
      ActivityTracker.belongsTo(models.CourseOffering, { foreignKey: 'allocationId', as: 'courseOffering' });
    }
  }
  ActivityTracker.init({
    allocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CourseOfferings',
        key: 'id'
      }
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    attendance: {
      type: DataTypes.JSON, // Array of booleans
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('attendance');
        if (!rawValue) return [];
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return [];
          }
        }
        return rawValue;
      },
      set(val) {
        this.setDataValue('attendance', JSON.stringify(val));
      }
    },
    formativeOneGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    formativeTwoGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    summativeGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    courseModeration: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    intranetSync: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    gradeBookStatus: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    }
  }, {
    sequelize,
    modelName: 'ActivityTracker',
  });
  return ActivityTracker;
};