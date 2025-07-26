'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityTrackers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      allocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CourseOfferings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weekNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      attendance: {
        type: Sequelize.JSON, // Array of booleans
        allowNull: true
      },
      formativeOneGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      formativeTwoGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      summativeGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      courseModeration: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      intranetSync: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      gradeBookStatus: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityTrackers');
  }
};