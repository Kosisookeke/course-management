# Notification System Testing Guide

This guide provides step-by-step instructions for testing the Redis-backed notification system in the Course Management Platform.

## Prerequisites

### 1. Install Redis Server

#### Windows:

1. Download Redis from the official website or use the provided `Redis-x64-3.0.504.msi`
2. Install Redis and start the service
3. Verify Redis is running: `redis-cli ping` (should return "PONG")

#### Linux/macOS:

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS with Homebrew
brew install redis
brew services start redis

# Verify
redis-cli ping
```

### 2. Environment Setup

Create or update your `.env` file:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=course_management_db

# JWT
JWT_SECRET=your_jwt_secret_key

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379

# Node Environment
NODE_ENV=development
PORT=3000
```

### 3. Database Setup

```bash
# Run migrations to create notification table
npm run db:migrate

# Seed the database with test data
npm run db:seed:all
```

## Testing Scenarios

### Scenario 1: Basic System Startup

#### Step 1: Start the Main Server

```bash
npm start
```

**Expected Output:**

```
✅ Database connection has been established successfully.
✅ Redis connected successfully
✅ Redis ready for operations
✅ Redis connection test successful
✅ Notification Queue Service initialized successfully
🚀 Server is running on port 3000
📚 API Documentation available at: http://localhost:3000/api-docs
🔔 Notification system: Active
```

#### Step 2: Start the Background Worker

Open a new terminal:

```bash
node workers/notificationWorker.js
```

**Expected Output:**

```
✅ Database connection established for worker
✅ Redis connection established for worker
✅ Notification queue service initialized for worker
✅ Notification Worker initialized successfully
✅ Scheduled jobs started:
   - Facilitator reminders: Every Monday at 9:00 AM
   - Manager alerts: Every Tuesday at 10:00 AM
   - Deadline warnings: Daily at 8:00 AM
   - Queue cleanup: Every hour
🚀 Notification Worker is running...
Press Ctrl+C to stop
```

### Scenario 2: Manual Notification Testing

#### Step 1: Create Test Users and Course Data

Use the API or database seeder to create:

- 1 Manager user
- 1 Facilitator user
- 1 Course offering assigned to the facilitator

#### Step 2: Test Facilitator Reminder

Create a test script `test-notifications.js`:

```javascript
const { initializeRedis } = require("./services/redisService");
const notificationQueueService = require("./services/notificationQueueService");
const { User, CourseOffering } = require("./models");

async function testFacilitatorReminder() {
  try {
    await initializeRedis();
    await notificationQueueService.initialize();

    // Get test facilitator and course offering
    const facilitator = await User.findOne({ where: { role: "facilitator" } });
    const courseOffering = await CourseOffering.findOne({
      where: { facilitatorId: facilitator.id },
    });

    // Queue a facilitator reminder
    const result = await notificationQueueService.queueFacilitatorReminder(
      facilitator.id,
      courseOffering.id,
      5 // Week 5
    );

    console.log("✅ Facilitator reminder queued:", result.job.id);

    // Wait for processing
    setTimeout(async () => {
      const stats = await notificationQueueService.getQueueStats();
      console.log("📊 Queue stats:", stats);
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testFacilitatorReminder();
```

Run the test:

```bash
node test-notifications.js
```

**Expected Output:**

```
✅ Facilitator reminder queued: reminder-1-1-5-1234567890
📧 NOTIFICATION SENT:
   To: facilitator@example.com
   Type: facilitator_reminder
   Title: Weekly Activity Log Reminder
   Message: Please submit your weekly activity log for Week 5...
✅ Facilitator reminder sent to facilitator@example.com for week 5
📊 Queue stats: { facilitatorReminders: { waiting: 0, active: 0, completed: 1, failed: 0, delayed: 0 } }
```

#### Step 3: Test Manager Alert

Add to your test script:

```javascript
async function testManagerAlert() {
  try {
    const manager = await User.findOne({ where: { role: "manager" } });
    const facilitator = await User.findOne({ where: { role: "facilitator" } });
    const courseOffering = await CourseOffering.findOne({
      where: { facilitatorId: facilitator.id },
    });

    const result = await notificationQueueService.queueManagerAlert(
      manager.id,
      { id: facilitator.id, email: facilitator.email },
      courseOffering.id,
      5,
      "missing_submission"
    );

    console.log("✅ Manager alert queued:", result.job.id);
  } catch (error) {
    console.error("❌ Manager alert test failed:", error);
  }
}
```

### Scenario 3: Activity Log Integration Testing

#### Step 1: Submit Activity Log (On Time)

```bash
curl -X POST http://localhost:3000/api/facilitator-activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FACILITATOR_TOKEN" \
  -d '{
    "allocationId": 1,
    "weekNumber": 5,
    "formativeOneGrading": "Done",
    "formativeTwoGrading": "Pending",
    "summativeGrading": "Not Started",
    "courseModeration": "Done",
    "intranetSync": "Done",
    "gradeBookStatus": "Pending",
    "attendance": [true, true, false, true, true]
  }'
```

**Expected:** No late submission alert should be triggered.

#### Step 2: Submit Activity Log (Late)

Submit an activity log for a past week to simulate late submission:

```bash
curl -X POST http://localhost:3000/api/facilitator-activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FACILITATOR_TOKEN" \
  -d '{
    "allocationId": 1,
    "weekNumber": 1,
    "formativeOneGrading": "Done",
    "formativeTwoGrading": "Done",
    "summativeGrading": "Done",
    "courseModeration": "Done",
    "intranetSync": "Done",
    "gradeBookStatus": "Done",
    "attendance": [true, true, true, true, true]
  }'
```

**Expected:** Manager alert should be queued for late submission.

### Scenario 4: Background Worker Testing

#### Step 1: Test Manual Triggers

With the worker running, you can manually trigger jobs:

```javascript
// In a separate test file or Node.js REPL
const notificationWorker = require("./workers/notificationWorker");

async function testWorker() {
  await notificationWorker.initialize();

  // Manually trigger facilitator reminders
  await notificationWorker.triggerFacilitatorReminders();

  // Manually trigger manager alerts
  await notificationWorker.triggerManagerAlerts();

  // Manually trigger deadline warnings
  await notificationWorker.triggerDeadlineWarnings();
}

testWorker();
```

#### Step 2: Monitor Queue Dashboard (Optional)

If you want a visual queue dashboard, add Bull Board to your app:

```javascript
// Add to app.js
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");

// After initializing notification service
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(notificationQueueService.queues.facilitatorReminders),
    new BullAdapter(notificationQueueService.queues.managerAlerts),
    new BullAdapter(notificationQueueService.queues.deadlineWarnings),
  ],
  serverAdapter: serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());
```

Then visit: `http://localhost:3000/admin/queues`

### Scenario 5: Unit Testing

#### Step 1: Run Notification Tests

```bash
npm test -- tests/notification.test.js
```

**Expected Output:**

```
 PASS  tests/notification.test.js
  Notification System
    Notification Model
      ✓ should create a facilitator reminder notification
      ✓ should create a manager alert notification
      ✓ should mark notification as sent
      ✓ should mark notification as failed
    Notification Queue Service
      ✓ should queue facilitator reminder
      ✓ should queue manager alert
      ✓ should get queue statistics
    Activity Tracker Integration
      ✓ should trigger late submission alert when activity log is submitted late
    Notification API Endpoints
      ✓ should allow managers to view all notifications
      ✓ should filter notifications by type
      ✓ should filter notifications by recipient
      ✓ should filter notifications by status
    Error Handling
      ✓ should handle queue failures gracefully
      ✓ should handle notification creation failures

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

#### Step 2: Run All Tests

```bash
npm test
```

### Scenario 6: Load Testing

#### Step 1: Create Load Test Script

```javascript
// load-test-notifications.js
const { initializeRedis } = require("./services/redisService");
const notificationQueueService = require("./services/notificationQueueService");

async function loadTest() {
  await initializeRedis();
  await notificationQueueService.initialize();

  const startTime = Date.now();
  const promises = [];

  // Queue 100 notifications
  for (let i = 0; i < 100; i++) {
    promises.push(
      notificationQueueService.queueFacilitatorReminder(1, 1, (i % 10) + 1)
    );
  }

  await Promise.all(promises);
  const endTime = Date.now();

  console.log(`✅ Queued 100 notifications in ${endTime - startTime}ms`);

  // Monitor processing
  setInterval(async () => {
    const stats = await notificationQueueService.getQueueStats();
    console.log("📊 Queue stats:", stats.facilitatorReminders);

    if (
      stats.facilitatorReminders.waiting === 0 &&
      stats.facilitatorReminders.active === 0
    ) {
      console.log("✅ All notifications processed");
      process.exit(0);
    }
  }, 1000);
}

loadTest();
```

## Troubleshooting

### Common Issues

#### 1. Redis Connection Failed

```
❌ Redis connection error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**

- Ensure Redis server is running
- Check Redis configuration in `.env`
- Verify firewall settings

#### 2. Queue Jobs Not Processing

```
⏳ Job 1 is waiting in facilitator reminders
```

**Solution:**

- Ensure background worker is running
- Check Redis memory usage
- Verify job processor setup

#### 3. Database Migration Errors

```
❌ Table 'Notifications' doesn't exist
```

**Solution:**

```bash
npm run db:migrate
```

#### 4. Missing Dependencies

```
❌ Cannot find module 'bull'
```

**Solution:**

```bash
npm install bull bull-board ioredis node-cron
```

### Monitoring Commands

#### Check Redis Status

```bash
redis-cli info server
redis-cli info memory
redis-cli monitor  # Watch real-time commands
```

#### Check Queue Status

```bash
# In Node.js REPL or test script
const notificationQueueService = require('./services/notificationQueueService');
notificationQueueService.getQueueStats().then(console.log);
```

#### Check Database Notifications

```sql
-- Connect to MySQL
SELECT * FROM Notifications ORDER BY createdAt DESC LIMIT 10;
SELECT type, status, COUNT(*) FROM Notifications GROUP BY type, status;
```

## Performance Benchmarks

### Expected Performance

- **Queue 100 notifications**: < 500ms
- **Process 100 notifications**: < 10 seconds
- **Memory usage**: < 50MB additional
- **Redis memory**: < 10MB for 1000 jobs

### Scaling Considerations

- **Multiple workers**: Run multiple worker processes for high load
- **Redis clustering**: Use Redis Cluster for high availability
- **Database indexing**: Ensure proper indexes on notification queries
- **Job priorities**: Use Bull's priority feature for urgent notifications

## Production Deployment

### Environment Variables

```env
# Production Redis (use Redis Cloud, AWS ElastiCache, etc.)
REDIS_URL=redis://username:password@host:port

# Email Service (integrate with SendGrid, AWS SES, etc.)
EMAIL_SERVICE_API_KEY=your_api_key
EMAIL_FROM_ADDRESS=noreply@yourcompany.com

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Process Management

```bash
# Use PM2 for production
npm install -g pm2

# Start main server
pm2 start server.js --name "course-management-api"

# Start notification worker
pm2 start workers/notificationWorker.js --name "notification-worker"

# Monitor
pm2 monit
```

This completes the comprehensive testing guide for the notification system. Follow these scenarios in order to verify that all components are working correctly.
