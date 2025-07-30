const { sequelize, User, Module, Class, Cohort, Mode, CourseOffering, ActivityTracker } = require('./models');
const bcrypt = require('bcryptjs');

async function createTestData() {
  console.log('🔧 Creating test data for notification system...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('🧹 Clearing existing data...');
    await ActivityTracker.destroy({ where: {} });
    await CourseOffering.destroy({ where: {} });
    await Mode.destroy({ where: {} });
    await Cohort.destroy({ where: {} });
    await Class.destroy({ where: {} });
    await Module.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('👥 Creating users...');
    const manager = await User.create({
      email: 'manager@example.com',
      password: 'password123',
      role: 'manager'
    });

    const facilitator = await User.create({
      email: 'facilitator@example.com',
      password: 'password123',
      role: 'facilitator'
    });

    const facilitator2 = await User.create({
      email: 'facilitator2@example.com',
      password: 'password123',
      role: 'facilitator'
    });

    const student = await User.create({
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    console.log(`   ✅ Created manager: ${manager.email} (ID: ${manager.id})`);
    console.log(`   ✅ Created facilitator: ${facilitator.email} (ID: ${facilitator.id})`);
    console.log(`   ✅ Created facilitator2: ${facilitator2.email} (ID: ${facilitator2.id})`);
    console.log(`   ✅ Created student: ${student.email} (ID: ${student.id})`);

    console.log('📚 Creating modules...');
    const module1 = await Module.create({
      name: 'Introduction to Programming',
      code: 'CS101',
      description: 'Basic programming concepts and fundamentals'
    });

    const module2 = await Module.create({
      name: 'Database Systems',
      code: 'CS201',
      description: 'Database design and management systems'
    });

    const module3 = await Module.create({
      name: 'Web Development',
      code: 'CS301',
      description: 'Modern web development technologies'
    });

    console.log(`   ✅ Created modules: ${module1.code}, ${module2.code}, ${module3.code}`);

    console.log('🏫 Creating classes...');
    const class1 = await Class.create({
      name: '2024S',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15')
    });

    const class2 = await Class.create({
      name: '2024J',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-10-01')
    });

    console.log(`   ✅ Created classes: ${class1.name}, ${class2.name}`);

    console.log('👨‍🎓 Creating cohorts...');
    const cohort1 = await Cohort.create({
      name: 'Cohort Alpha',
      year: 2024
    });

    const cohort2 = await Cohort.create({
      name: 'Cohort Beta',
      year: 2024
    });

    console.log(`   ✅ Created cohorts: ${cohort1.name}, ${cohort2.name}`);

    console.log('🖥️ Creating modes...');
    const modeOnline = await Mode.create({ name: 'Online' });
    const modeInPerson = await Mode.create({ name: 'In-person' });
    const modeHybrid = await Mode.create({ name: 'Hybrid' });

    console.log(`   ✅ Created modes: ${modeOnline.name}, ${modeInPerson.name}, ${modeHybrid.name}`);

    console.log('📋 Creating course offerings...');
    const offering1 = await CourseOffering.create({
      moduleId: module1.id,
      classId: class1.id,
      trimester: 'T1',
      cohortId: cohort1.id,
      intake: 'FT',
      modeId: modeOnline.id,
      facilitatorId: facilitator.id
    });

    const offering2 = await CourseOffering.create({
      moduleId: module2.id,
      classId: class1.id,
      trimester: 'T1',
      cohortId: cohort1.id,
      intake: 'FT',
      modeId: modeInPerson.id,
      facilitatorId: facilitator.id
    });

    const offering3 = await CourseOffering.create({
      moduleId: module3.id,
      classId: class2.id,
      trimester: 'T2',
      cohortId: cohort2.id,
      intake: 'HT1',
      modeId: modeHybrid.id,
      facilitatorId: facilitator2.id
    });

    console.log(`   ✅ Created ${offering1.id} course offerings`);
    console.log(`   ✅ Facilitator ${facilitator.email} assigned to offerings ${offering1.id}, ${offering2.id}`);
    console.log(`   ✅ Facilitator ${facilitator2.email} assigned to offering ${offering3.id}`);

    console.log('📊 Creating activity tracker records...');
    const activity1 = await ActivityTracker.create({
      allocationId: offering1.id,
      weekNumber: 1,
      attendance: [true, true, false, true, true],
      formativeOneGrading: 'Done',
      formativeTwoGrading: 'Pending',
      summativeGrading: 'Not Started',
      courseModeration: 'Done',
      intranetSync: 'Done',
      gradeBookStatus: 'Pending'
    });

    const activity2 = await ActivityTracker.create({
      allocationId: offering1.id,
      weekNumber: 2,
      attendance: [true, true, true, false, true],
      formativeOneGrading: 'Done',
      formativeTwoGrading: 'Done',
      summativeGrading: 'Pending',
      courseModeration: 'Pending',
      intranetSync: 'Done',
      gradeBookStatus: 'Done'
    });

    console.log(`   ✅ Created activity records for weeks 1 and 2`);

    console.log('\n✅ Test data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Users: ${await User.count()}`);
    console.log(`   Modules: ${await Module.count()}`);
    console.log(`   Classes: ${await Class.count()}`);
    console.log(`   Cohorts: ${await Cohort.count()}`);
    console.log(`   Modes: ${await Mode.count()}`);
    console.log(`   Course Offerings: ${await CourseOffering.count()}`);
    console.log(`   Activity Records: ${await ActivityTracker.count()}`);

    return {
      manager,
      facilitator,
      facilitator2,
      student,
      offerings: [offering1, offering2, offering3]
    };

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  createTestData()
    .then(() => {
      console.log('\n🎉 Ready to test notifications!');
      console.log('Next: Run "node test-notifications.js"');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to create test data:', error);
      process.exit(1);
    });
}

module.exports = createTestData;