'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('Users', [
      {
        email: 'manager@example.com',
        password: hashedPassword,
        role: 'manager',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'facilitator@example.com',
        password: hashedPassword,
        role: 'facilitator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'student@example.com',
        password: hashedPassword,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};