'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mode extends Model {
    static associate(models) {
      Mode.hasMany(models.CourseOffering, { foreignKey: 'modeId', as: 'courseOfferings' });
    }
  }
  Mode.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Mode',
  });
  return Mode;
};