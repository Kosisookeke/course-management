'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Skip users since they're already created by the previous seeder
    
    // Insert Modules
    await queryInterface.bulkInsert('Modules', [
      {
        name: 'Introduction to Programming',
        code: 'CS101',
        description: 'Basic programming concepts and fundamentals',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Database Systems',
        code: 'CS201',
        description: 'Database design and management systems',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Web Development',
        code: 'CS301',
        description: 'Modern web development technologies',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert Classes
    await queryInterface.bulkInsert('Classes', [
      {
        name: '2024S',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '2024J',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-10-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '2025S',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert Cohorts
    await queryInterface.bulkInsert('Cohorts', [
      {
        name: 'Cohort Alpha',
        year: 2024,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cohort Beta',
        year: 2024,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cohort Gamma',
        year: 2025,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert Modes
    await queryInterface.bulkInsert('Modes', [
      {
        name: 'Online',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'In-person',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hybrid',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert Course Offerings (using auto-generated IDs)
    await queryInterface.bulkInsert('CourseOfferings', [
      {
        moduleId: 1,
        classId: 1,
        trimester: 'T1',
        cohortId: 1,
        intake: 'FT',
        modeId: 1,
        facilitatorId: 2, // facilitator@example.com
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        moduleId: 2,
        classId: 1,
        trimester: 'T1',
        cohortId: 1,
        intake: 'FT',
        modeId: 2,
        facilitatorId: 2, // facilitator@example.com
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        moduleId: 3,
        classId: 2,
        trimester: 'T2',
        cohortId: 2,
        intake: 'HT1',
        modeId: 3,
        facilitatorId: 2, // facilitator@example.com (changed from 3 to 2)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        moduleId: 1,
        classId: 3,
        trimester: 'T1',
        cohortId: 3,
        intake: 'FT',
        modeId: 1,
        facilitatorId: null, // Unassigned
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Insert some sample Activity Tracker records
    await queryInterface.bulkInsert('ActivityTrackers', [
      {
        allocationId: 1,
        weekNumber: 1,
        attendance: JSON.stringify([true, true, false, true, true]),
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Pending',
        summativeGrading: 'Not Started',
        courseModeration: 'Done',
        intranetSync: 'Done',
        gradeBookStatus: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        allocationId: 1,
        weekNumber: 2,
        attendance: JSON.stringify([true, true, true, false, true]),
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Done',
        summativeGrading: 'Pending',
        courseModeration: 'Pending',
        intranetSync: 'Done',
        gradeBookStatus: 'Done',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        allocationId: 2,
        weekNumber: 1,
        attendance: JSON.stringify([true, true, true, true, false]),
        formativeOneGrading: 'Pending',
        formativeTwoGrading: 'Not Started',
        summativeGrading: 'Not Started',
        courseModeration: 'Not Started',
        intranetSync: 'Pending',
        gradeBookStatus: 'Not Started',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ Complete test data seeded successfully');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ActivityTrackers', null, {});
    await queryInterface.bulkDelete('CourseOfferings', null, {});
    await queryInterface.bulkDelete('Modes', null, {});
    await queryInterface.bulkDelete('Cohorts', null, {});
    await queryInterface.bulkDelete('Classes', null, {});
    await queryInterface.bulkDelete('Modules', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};