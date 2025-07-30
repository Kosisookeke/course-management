const { initializeRedis } = require('./services/redisService');
const notificationQueueService = require('./services/notificationQueueService');
const { sequelize, User, CourseOffering, Module, Class } = require('./models');

async function testNotificationSystem() {
  console.log('🧪 Starting Notification System Test...\n');

  try {
    // Initialize connections
    console.log('1️⃣ Initializing connections...');
    await sequelize.authenticate();
    console.log('   ✅ Database connected');

    await initializeRedis();
    console.log('   ✅ Redis connected');

    await notificationQueueService.initialize();
    console.log('   ✅ Notification queue service initialized\n');

    // Get test data
    console.log('2️⃣ Fetching test data...');
    const facilitator = await User.findOne({ 
      where: { role: 'facilitator' },
      include: [{ model: CourseOffering, as: 'courseOfferings' }]
    });

    const manager = await User.findOne({ where: { role: 'manager' } });

    if (!facilitator || !manager) {
      console.log('   ⚠️ No test users found. Please run: npm run db:seed:all');
      return;
    }

    const courseOffering = facilitator.courseOfferings[0];
    if (!courseOffering) {
      console.log('   ⚠️ No course offerings found for facilitator');
      return;
    }

    console.log(`   ✅ Found facilitator: ${facilitator.email}`);
    console.log(`   ✅ Found manager: ${manager.email}`);
    console.log(`   ✅ Found course offering: ID ${courseOffering.id}\n`);

    // Test 1: Queue Facilitator Reminder
    console.log('3️⃣ Testing Facilitator Reminder...');
    const reminderResult = await notificationQueueService.queueFacilitatorReminder(
      facilitator.id,
      courseOffering.id,
      5 // Week 5
    );
    console.log(`   ✅ Queued facilitator reminder: Job ID ${reminderResult.job.id}`);

    // Test 2: Queue Manager Alert
    console.log('4️⃣ Testing Manager Alert...');
    const alertResult = await notificationQueueService.queueManagerAlert(
      manager.id,
      { id: facilitator.id, email: facilitator.email },
      courseOffering.id,
      5,
      'missing_submission'
    );
    console.log(`   ✅ Queued manager alert: Job ID ${alertResult.job.id}`);

    // Test 3: Check Queue Statistics
    console.log('5️⃣ Checking queue statistics...');
    
    // Wait a moment for jobs to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stats = await notificationQueueService.getQueueStats();
    console.log('   📊 Queue Statistics:');
    console.log(`      Facilitator Reminders - Waiting: ${stats.facilitatorReminders.waiting}, Active: ${stats.facilitatorReminders.active}, Completed: ${stats.facilitatorReminders.completed}`);
    console.log(`      Manager Alerts - Waiting: ${stats.managerAlerts.waiting}, Active: ${stats.managerAlerts.active}, Completed: ${stats.managerAlerts.completed}`);

    console.log('\n✅ Notification System Test Completed Successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start the background worker: npm run worker');
    console.log('   2. Run the full test suite: npm run test:notifications');
    console.log('   3. Check the testing guide: docs/NOTIFICATION_TESTING_GUIDE.md');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure Redis is running: redis-cli ping');
    console.error('   2. Run database migrations: npm run db:migrate');
    console.error('   3. Seed test data: npm run db:seed:all');
  } finally {
    // Cleanup
    try {
      await notificationQueueService.cleanup();
      await sequelize.close();
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted, cleaning up...');
  try {
    await notificationQueueService.cleanup();
    await sequelize.close();
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
  process.exit(0);
});

// Run the test
testNotificationSystem();