const Queue = require('bull');
const { getRedisClient } = require('./redisService');
const { Notification, User, CourseOffering, Module, Class } = require('../models');

class NotificationQueueService {
  constructor() {
    this.queues = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const redisClient = getRedisClient();
      
      // Create different queues for different types of notifications
      this.queues.facilitatorReminders = new Queue('facilitator reminders', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 20,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      this.queues.managerAlerts = new Queue('manager alerts', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 20,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      this.queues.deadlineWarnings = new Queue('deadline warnings', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 20,
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      });

      // Set up job processors
      this.setupJobProcessors();
      
      this.initialized = true;
      console.log('✅ Notification Queue Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Notification Queue Service:', error);
      throw error;
    }
  }

  setupJobProcessors() {
    // Process facilitator reminder jobs
    this.queues.facilitatorReminders.process('send-reminder', async (job) => {
      const { notificationId, facilitatorId, allocationId, weekNumber } = job.data;
      
      try {
        const notification = await Notification.findByPk(notificationId, {
          include: [
            { model: User, as: 'recipient' },
            { 
              model: CourseOffering, 
              as: 'courseOffering',
              include: [
                { model: Module, as: 'module' },
                { model: Class, as: 'class' }
              ]
            }
          ]
        });

        if (!notification) {
          throw new Error(`Notification ${notificationId} not found`);
        }

        // Simulate sending notification (in real app, this would be email/SMS/push notification)
        await this.sendNotification(notification);
        
        // Mark notification as sent
        await notification.markAsSent();
        
        console.log(`✅ Facilitator reminder sent to ${notification.recipient.email} for week ${weekNumber}`);
        
        return { success: true, notificationId, sentAt: new Date() };
      } catch (error) {
        console.error(`❌ Failed to send facilitator reminder:`, error);
        
        // Mark notification as failed
        if (notificationId) {
          const notification = await Notification.findByPk(notificationId);
          if (notification) {
            await notification.markAsFailed(error);
          }
        }
        
        throw error;
      }
    });

    // Process manager alert jobs
    this.queues.managerAlerts.process('send-alert', async (job) => {
      const { notificationId, managerId, facilitatorInfo, alertType } = job.data;
      
      try {
        const notification = await Notification.findByPk(notificationId, {
          include: [
            { model: User, as: 'recipient' },
            { 
              model: CourseOffering, 
              as: 'courseOffering',
              include: [
                { model: Module, as: 'module' },
                { model: Class, as: 'class' }
              ]
            }
          ]
        });

        if (!notification) {
          throw new Error(`Notification ${notificationId} not found`);
        }

        // Simulate sending notification
        await this.sendNotification(notification);
        
        // Mark notification as sent
        await notification.markAsSent();
        
        console.log(`✅ Manager alert sent to ${notification.recipient.email} for ${alertType}`);
        
        return { success: true, notificationId, sentAt: new Date() };
      } catch (error) {
        console.error(`❌ Failed to send manager alert:`, error);
        
        // Mark notification as failed
        if (notificationId) {
          const notification = await Notification.findByPk(notificationId);
          if (notification) {
            await notification.markAsFailed(error);
          }
        }
        
        throw error;
      }
    });

    // Process deadline warning jobs
    this.queues.deadlineWarnings.process('send-warning', async (job) => {
      const { notificationId, recipientId, weekNumber } = job.data;
      
      try {
        const notification = await Notification.findByPk(notificationId, {
          include: [
            { model: User, as: 'recipient' },
            { 
              model: CourseOffering, 
              as: 'courseOffering',
              include: [
                { model: Module, as: 'module' },
                { model: Class, as: 'class' }
              ]
            }
          ]
        });

        if (!notification) {
          throw new Error(`Notification ${notificationId} not found`);
        }

        // Simulate sending notification
        await this.sendNotification(notification);
        
        // Mark notification as sent
        await notification.markAsSent();
        
        console.log(`✅ Deadline warning sent to ${notification.recipient.email} for week ${weekNumber}`);
        
        return { success: true, notificationId, sentAt: new Date() };
      } catch (error) {
        console.error(`❌ Failed to send deadline warning:`, error);
        
        // Mark notification as failed
        if (notificationId) {
          const notification = await Notification.findByPk(notificationId);
          if (notification) {
            await notification.markAsFailed(error);
          }
        }
        
        throw error;
      }
    });

    // Set up error handlers
    Object.values(this.queues).forEach(queue => {
      queue.on('error', (error) => {
        console.error(`❌ Queue error in ${queue.name}:`, error);
      });

      queue.on('waiting', (jobId) => {
        console.log(`⏳ Job ${jobId} is waiting in ${queue.name}`);
      });

      queue.on('active', (job, jobPromise) => {
        console.log(`🔄 Job ${job.id} started in ${queue.name}`);
      });

      queue.on('completed', (job, result) => {
        console.log(`✅ Job ${job.id} completed in ${queue.name}`);
      });

      queue.on('failed', (job, err) => {
        console.error(`❌ Job ${job.id} failed in ${queue.name}:`, err.message);
      });
    });
  }

  // Simulate sending notification (replace with actual email/SMS/push service)
  async sendNotification(notification) {
    // In a real application, this would integrate with:
    // - Email service (SendGrid, AWS SES, etc.)
    // - SMS service (Twilio, AWS SNS, etc.)
    // - Push notification service (Firebase, etc.)
    
    console.log(`📧 NOTIFICATION SENT:`);
    console.log(`   To: ${notification.recipient.email}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Title: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
    console.log(`   Metadata:`, notification.metadata);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  }

  // Queue facilitator reminder
  async queueFacilitatorReminder(facilitatorId, allocationId, weekNumber, delay = 0) {
    if (!this.initialized) {
      throw new Error('NotificationQueueService not initialized');
    }

    try {
      // Get course information
      const courseOffering = await CourseOffering.findByPk(allocationId, {
        include: [
          { model: Module, as: 'module' },
          { model: Class, as: 'class' }
        ]
      });

      if (!courseOffering) {
        throw new Error(`Course offering ${allocationId} not found`);
      }

      const courseInfo = {
        moduleName: courseOffering.module.name,
        moduleCode: courseOffering.module.code,
        className: courseOffering.class.name,
        trimester: courseOffering.trimester,
        intake: courseOffering.intake
      };

      // Create notification record
      const notification = await Notification.createFacilitatorReminder(
        facilitatorId,
        allocationId,
        weekNumber,
        courseInfo
      );

      // Queue the job
      const job = await this.queues.facilitatorReminders.add('send-reminder', {
        notificationId: notification.id,
        facilitatorId,
        allocationId,
        weekNumber,
        courseInfo
      }, {
        delay,
        jobId: `reminder-${facilitatorId}-${allocationId}-${weekNumber}-${Date.now()}`
      });

      console.log(`📋 Queued facilitator reminder job ${job.id} for week ${weekNumber}`);
      
      return { notification, job };
    } catch (error) {
      console.error('❌ Failed to queue facilitator reminder:', error);
      throw error;
    }
  }

  // Queue manager alert
  async queueManagerAlert(managerId, facilitatorInfo, allocationId, weekNumber, alertType, delay = 0) {
    if (!this.initialized) {
      throw new Error('NotificationQueueService not initialized');
    }

    try {
      // Create notification record
      const notification = await Notification.createManagerAlert(
        managerId,
        facilitatorInfo,
        allocationId,
        weekNumber,
        alertType
      );

      // Queue the job
      const job = await this.queues.managerAlerts.add('send-alert', {
        notificationId: notification.id,
        managerId,
        facilitatorInfo,
        allocationId,
        weekNumber,
        alertType
      }, {
        delay,
        jobId: `alert-${managerId}-${facilitatorInfo.id}-${alertType}-${Date.now()}`
      });

      console.log(`📋 Queued manager alert job ${job.id} for ${alertType}`);
      
      return { notification, job };
    } catch (error) {
      console.error('❌ Failed to queue manager alert:', error);
      throw error;
    }
  }

  // Get queue statistics
  async getQueueStats() {
    const stats = {};
    
    for (const [name, queue] of Object.entries(this.queues)) {
      stats[name] = {
        waiting: await queue.getWaiting().then(jobs => jobs.length),
        active: await queue.getActive().then(jobs => jobs.length),
        completed: await queue.getCompleted().then(jobs => jobs.length),
        failed: await queue.getFailed().then(jobs => jobs.length),
        delayed: await queue.getDelayed().then(jobs => jobs.length),
      };
    }
    
    return stats;
  }

  // Clean up queues
  async cleanup() {
    for (const queue of Object.values(this.queues)) {
      await queue.close();
    }
    console.log('✅ Notification queues cleaned up');
  }
}

// Export singleton instance
const notificationQueueService = new NotificationQueueService();
module.exports = notificationQueueService;