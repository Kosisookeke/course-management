'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cohort extends Model {
    static associate(models) {
      Cohort.hasMany(models.CourseOffering, { foreignKey: 'cohortId', as: 'courseOfferings' });
    }
  }
  Cohort.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Cohort',
  });
  return Cohort;
};