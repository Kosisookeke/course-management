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
      await sequelize.authenticate();
      console.log('✅ Database connection established for worker');

      await initializeRedis();
      console.log('✅ Redis connection established for worker');

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

    const facilitatorReminderJob = cron.schedule('0 9 * * 1', async () => {
      console.log('🔄 Running weekly facilitator reminder job...');
      await this.sendWeeklyFacilitatorReminders();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    const managerAlertJob = cron.schedule('0 10 * * 2', async () => {
      console.log('🔄 Running manager compliance alert job...');
      await this.checkComplianceAndAlertManagers();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    const deadlineWarningJob = cron.schedule('0 8 * * *', async () => {
      console.log('🔄 Running deadline warning job...');
      await this.sendDeadlineWarnings();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    const cleanupJob = cron.schedule('0 * * * *', async () => {
      console.log('🔄 Running queue cleanup job...');
      await this.cleanupCompletedJobs();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

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
        const existingLog = await ActivityTracker.findOne({
          where: {
            allocationId: offering.id,
            weekNumber: currentWeek
          }
        });

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

      const managers = await User.findAll({
        where: { role: 'manager' }
      });

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
          const lastWeekLog = await ActivityTracker.findOne({
            where: {
              allocationId: offering.id,
              weekNumber: lastWeek
            }
          });

          if (!lastWeekLog) {
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

      if (currentDay === 4) {
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
          const existingLog = await ActivityTracker.findOne({
            where: {
              allocationId: offering.id,
              weekNumber: currentWeek
            }
          });

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
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  async stop() {
    console.log('🛑 Stopping Notification Worker...');

    this.cronJobs.forEach(job => {
      job.stop();
      job.destroy();
    });

    await notificationQueueService.cleanup();

    await sequelize.close();

    this.isRunning = false;
    console.log('✅ Notification Worker stopped');
  }

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

const notificationWorker = new NotificationWorker();

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