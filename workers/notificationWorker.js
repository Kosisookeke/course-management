const cron = require('node-cron');
const { initializeRedis } = require('../services/redisService');
const notificationQueueService = require('../services/notificationQueueService');
const { sequelize, User, CourseOffering, ActivityTracker, Module, Class } = require('../models');
const { Op } = require('sequelize');

class NotificationWorker {
  constructor() {
    this.isRunning = false;
    this.cronJobs = [];
  }

  async initialize() {
    try {
      // Initialize database connection
      await sequelize.authenticate();
      console.log('✅ Database connection established for worker');

      // Initialize Redis connection
      await initializeRedis();
      console.log('✅ Redis connection established for worker');

      // Initialize notification queue service
      await notificationQueueService.initialize();
      console.log('✅ Notification queue service initialized for worker');

      this.isRunning = true;
      console.log('✅ Notification Worker initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Notification Worker:', error);
      throw error;
    }
  }

  startScheduledJobs() {
    if (!this.isRunning) {
      throw new Error('Worker not initialized. Call initialize() first.');
    }

    // Schedule facilitator reminders - Run every Monday at 9:00 AM
    const facilitatorReminderJob = cron.schedule('0 9 * * 1', async () => {
      console.log('🔄 Running weekly facilitator reminder job...');
      await this.sendWeeklyFacilitatorReminders();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Schedule manager compliance alerts - Run every Tuesday at 10:00 AM
    const managerAlertJob = cron.schedule('0 10 * * 2', async () => {
      console.log('🔄 Running manager compliance alert job...');
      await this.checkComplianceAndAlertManagers();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Schedule deadline warnings - Run daily at 8:00 AM
    const deadlineWarningJob = cron.schedule('0 8 * * *', async () => {
      console.log('🔄 Running deadline warning job...');
      await this.sendDeadlineWarnings();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Schedule queue cleanup - Run every hour
    const cleanupJob = cron.schedule('0 * * * *', async () => {
      console.log('🔄 Running queue cleanup job...');
      await this.cleanupCompletedJobs();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Start all jobs
    facilitatorReminderJob.start();
    managerAlertJob.start();
    deadlineWarningJob.start();
    cleanupJob.start();

    this.cronJobs = [facilitatorReminderJob, managerAlertJob, deadlineWarningJob, cleanupJob];

    console.log('✅ Scheduled jobs started:');
    console.log('   - Facilitator reminders: Every Monday at 9:00 AM');
    console.log('   - Manager alerts: Every Tuesday at 10:00 AM');
    console.log('   - Deadline warnings: Daily at 8:00 AM');
    console.log('   - Queue cleanup: Every hour');
  }

  async sendWeeklyFacilitatorReminders() {
    try {
      const currentWeek = this.getCurrentWeekNumber();
      
      // Get all active course offerings with facilitators
      const courseOfferings = await CourseOffering.findAll({
        where: {
          facilitatorId: { [Op.not]: null }
        },
        include: [
          { model: User, as: 'facilitator' },
          { model: Module, as: 'module' },
          { model: Class, as: 'class' }
        ]
      });

      let remindersSent = 0;

      for (const offering of courseOfferings) {
        // Check if facilitator has already submitted log for current week
        const existingLog = await ActivityTracker.findOne({
          where: {
            allocationId: offering.id,
            weekNumber: currentWeek
          }
        });

        // If no log exists, send reminder
        if (!existingLog) {
          await notificationQueueService.queueFacilitatorReminder(
            offering.facilitatorId,
            offering.id,
            currentWeek
          );
          remindersSent++;
        }
      }

      console.log(`✅ Queued ${remindersSent} facilitator reminders for week ${currentWeek}`);
    } catch (error) {
      console.error('❌ Error sending weekly facilitator reminders:', error);
    }
  }

  async checkComplianceAndAlertManagers() {
    try {
      const currentWeek = this.getCurrentWeekNumber();
      const lastWeek = currentWeek - 1;

      // Get all managers
      const managers = await User.findAll({
        where: { role: 'manager' }
      });

      // Get all facilitators with their course offerings
      const facilitators = await User.findAll({
        where: { role: 'facilitator' },
        include: [{
          model: CourseOffering,
          as: 'courseOfferings',
          include: [
            { model: Module, as: 'module' },
            { model: Class, as: 'class' }
          ]
        }]
      });

      let alertsSent = 0;

      for (const facilitator of facilitators) {
        for (const offering of facilitator.courseOfferings) {
          // Check for missing submissions in the last week
          const lastWeekLog = await ActivityTracker.findOne({
            where: {
              allocationId: offering.id,
              weekNumber: lastWeek
            }
          });

          if (!lastWeekLog) {
            // Send alert to all managers about missing submission
            for (const manager of managers) {
              await notificationQueueService.queueManagerAlert(
                manager.id,
                {
                  id: facilitator.id,
                  email: facilitator.email
                },
                offering.id,
                lastWeek,
                'missing_submission'
              );
              alertsSent++;
            }
          }

          // Check for compliance warnings (multiple missing submissions)
          const recentLogs = await ActivityTracker.findAll({
            where: {
              allocationId: offering.id,
              weekNumber: { [Op.gte]: currentWeek - 4 } // Last 4 weeks
            }
          });

          const missedWeeks = [];
          for (let week = currentWeek - 4; week < currentWeek; week++) {
            const weekLog = recentLogs.find(log => log.weekNumber === week);
            if (!weekLog) {
              missedWeeks.push(week);
            }
          }

          // If facilitator missed 2 or more weeks in the last 4 weeks, send compliance warning
          if (missedWeeks.length >= 2) {
            for (const manager of managers) {
              await notificationQueueService.queueManagerAlert(
                manager.id,
                {
                  id: facilitator.id,
                  email: facilitator.email,
                  missedWeeks
                },
                offering.id,
                currentWeek,
                'compliance_warning'
              );
              alertsSent++;
            }
          }
        }
      }

      console.log(`✅ Queued ${alertsSent} manager alerts for compliance monitoring`);
    } catch (error) {
      console.error('❌ Error checking compliance and alerting managers:', error);
    }
  }

  async sendDeadlineWarnings() {
    try {
      const currentWeek = this.getCurrentWeekNumber();
      const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Send warnings on Thursday (day 4) for submissions due by end of week
      if (currentDay === 4) {
        // Get all active course offerings with facilitators
        const courseOfferings = await CourseOffering.findAll({
          where: {
            facilitatorId: { [Op.not]: null }
          },
          include: [
            { model: User, as: 'facilitator' },
            { model: Module, as: 'module' },
            { model: Class, as: 'class' }
          ]
        });

        let warningsSent = 0;

        for (const offering of courseOfferings) {
          // Check if facilitator has already submitted log for current week
          const existingLog = await ActivityTracker.findOne({
            where: {
              allocationId: offering.id,
              weekNumber: currentWeek
            }
          });

          // If no log exists, send deadline warning
          if (!existingLog) {
            const notification = await Notification.create({
              type: 'deadline_warning',
              recipientId: offering.facilitatorId,
              allocationId: offering.id,
              weekNumber: currentWeek,
              title: 'Activity Log Deadline Approaching',
              message: `Reminder: Your activity log for Week ${currentWeek} of ${offering.module.name} is due by end of this week.`,
              metadata: {
                courseInfo: {
                  moduleName: offering.module.name,
                  moduleCode: offering.module.code,
                  className: offering.class.name
                },
                deadlineType: 'weekly_submission',
                daysRemaining: 3
              }
            });

            await notificationQueueService.queues.deadlineWarnings.add('send-warning', {
              notificationId: notification.id,
              recipientId: offering.facilitatorId,
              weekNumber: currentWeek
            });

            warningsSent++;
          }
        }

        console.log(`✅ Queued ${warningsSent} deadline warnings for week ${currentWeek}`);
      }
    } catch (error) {
      console.error('❌ Error sending deadline warnings:', error);
    }
  }

  async cleanupCompletedJobs() {
    try {
      const stats = await notificationQueueService.getQueueStats();
      console.log('📊 Queue statistics:', stats);

      // Clean up completed jobs older than 24 hours
      for (const queue of Object.values(notificationQueueService.queues)) {
        await queue.clean(24 * 60 * 60 * 1000, 'completed');
        await queue.clean(24 * 60 * 60 * 1000, 'failed');
      }

      console.log('✅ Queue cleanup completed');
    } catch (error) {
      console.error('❌ Error during queue cleanup:', error);
    }
  }

  getCurrentWeekNumber() {
    // Simple week calculation - in production, this should be more sophisticated
    // based on academic calendar
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  async stop() {
    console.log('🛑 Stopping Notification Worker...');

    // Stop all cron jobs
    this.cronJobs.forEach(job => {
      job.stop();
      job.destroy();
    });

    // Cleanup notification queues
    await notificationQueueService.cleanup();

    // Close database connection
    await sequelize.close();

    this.isRunning = false;
    console.log('✅ Notification Worker stopped');
  }

  // Manual trigger methods for testing
  async triggerFacilitatorReminders() {
    console.log('🔧 Manually triggering facilitator reminders...');
    await this.sendWeeklyFacilitatorReminders();
  }

  async triggerManagerAlerts() {
    console.log('🔧 Manually triggering manager alerts...');
    await this.checkComplianceAndAlertManagers();
  }

  async triggerDeadlineWarnings() {
    console.log('🔧 Manually triggering deadline warnings...');
    await this.sendDeadlineWarnings();
  }
}

// Export singleton instance
const notificationWorker = new NotificationWorker();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await notificationWorker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await notificationWorker.stop();
  process.exit(0);
});

module.exports = notificationWorker;

// If this file is run directly, start the worker
if (require.main === module) {
  (async () => {
    try {
      await notificationWorker.initialize();
      notificationWorker.startScheduledJobs();
      console.log('🚀 Notification Worker is running...');
      console.log('Press Ctrl+C to stop');
    } catch (error) {
      console.error('❌ Failed to start Notification Worker:', error);
      process.exit(1);
    }
  })();
}