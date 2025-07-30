const request = require('supertest');
const app = require('../app');
const { sequelize, User, Module, Class, Cohort, Mode, CourseOffering, ActivityTracker, Notification } = require('../models');
const jwt = require('jsonwebtoken');

describe('Notification System', () => {
  let managerToken, facilitatorToken, testData;

  beforeAll(async () => {
    // Initialize database
    await sequelize.sync({ force: true });

    // Create test data
    const manager = await User.create({ 
      email: 'testmanager@example.com', 
      password: 'password123', 
      role: 'manager' 
    });
    
    const facilitator = await User.create({ 
      email: 'testfacilitator@example.com', 
      password: 'password123', 
      role: 'facilitator' 
    });

    const testModule = await Module.create({ 
      name: 'Test Module', 
      code: 'TM101', 
      description: 'A test module' 
    });

    const testClass = await Class.create({ 
      name: '2024T', 
      startDate: new Date(), 
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)) 
    });

    const testCohort = await Cohort.create({ 
      name: 'Cohort A', 
      year: 2024 
    });

    const testMode = await Mode.create({ 
      name: 'Online' 
    });

    const courseOffering = await CourseOffering.create({
      moduleId: testModule.id,
      classId: testClass.id,
      trimester: 'T1',
      cohortId: testCohort.id,
      intake: 'FT',
      modeId: testMode.id,
      facilitatorId: facilitator.id
    });

    managerToken = jwt.sign({ id: manager.id }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    facilitatorToken = jwt.sign({ id: facilitator.id }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });

    testData = {
      manager,
      facilitator,
      testModule,
      testClass,
      testCohort,
      testMode,
      courseOffering
    };
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Notification Model', () => {
    it('should create a facilitator reminder notification', async () => {
      const courseInfo = {
        moduleName: testData.testModule.name,
        moduleCode: testData.testModule.code,
        className: testData.testClass.name
      };

      const notification = await Notification.createFacilitatorReminder(
        testData.facilitator.id,
        testData.courseOffering.id,
        5,
        courseInfo
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe('facilitator_reminder');
      expect(notification.recipientId).toBe(testData.facilitator.id);
      expect(notification.weekNumber).toBe(5);
      expect(notification.title).toBe('Weekly Activity Log Reminder');
      expect(notification.status).toBe('pending');
    });

    it('should create a manager alert notification', async () => {
      const facilitatorInfo = {
        id: testData.facilitator.id,
        email: testData.facilitator.email
      };

      const notification = await Notification.createManagerAlert(
        testData.manager.id,
        facilitatorInfo,
        testData.courseOffering.id,
        5,
        'missing_submission'
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe('manager_alert');
      expect(notification.recipientId).toBe(testData.manager.id);
      expect(notification.weekNumber).toBe(5);
      expect(notification.title).toBe('Missing Activity Log Submission');
      expect(notification.status).toBe('pending');
    });

    it('should mark notification as sent', async () => {
      const notification = await Notification.create({
        type: 'facilitator_reminder',
        recipientId: testData.facilitator.id,
        allocationId: testData.courseOffering.id,
        weekNumber: 6,
        title: 'Test Notification',
        message: 'Test message'
      });

      await notification.markAsSent();

      expect(notification.status).toBe('sent');
      expect(notification.sentAt).toBeDefined();
    });

    it('should mark notification as failed', async () => {
      const notification = await Notification.create({
        type: 'facilitator_reminder',
        recipientId: testData.facilitator.id,
        allocationId: testData.courseOffering.id,
        weekNumber: 7,
        title: 'Test Notification',
        message: 'Test message'
      });

      const error = new Error('Test error');
      await notification.markAsFailed(error);

      expect(notification.status).toBe('failed');
      expect(notification.metadata.error).toBe('Test error');
    });
  });

  describe('Notification Database Operations', () => {
    it('should store and retrieve notifications with relationships', async () => {
      const notification = await Notification.create({
        type: 'facilitator_reminder',
        recipientId: testData.facilitator.id,
        allocationId: testData.courseOffering.id,
        weekNumber: 8,
        title: 'Test Notification',
        message: 'Test message',
        metadata: { test: 'data' }
      });

      const retrieved = await Notification.findByPk(notification.id, {
        include: [
          { model: User, as: 'recipient' },
          { model: CourseOffering, as: 'courseOffering' }
        ]
      });

      expect(retrieved).toBeDefined();
      expect(retrieved.recipient.email).toBe(testData.facilitator.email);
      expect(retrieved.courseOffering.id).toBe(testData.courseOffering.id);
      expect(retrieved.metadata.test).toBe('data');
    });

    it('should filter notifications by type', async () => {
      const facilitatorReminders = await Notification.findAll({
        where: { type: 'facilitator_reminder' }
      });

      const managerAlerts = await Notification.findAll({
        where: { type: 'manager_alert' }
      });

      expect(facilitatorReminders.length).toBeGreaterThan(0);
      expect(managerAlerts.length).toBeGreaterThan(0);
    });

    it('should filter notifications by recipient', async () => {
      const facilitatorNotifications = await Notification.findAll({
        where: { recipientId: testData.facilitator.id }
      });

      const managerNotifications = await Notification.findAll({
        where: { recipientId: testData.manager.id }
      });

      expect(facilitatorNotifications.length).toBeGreaterThan(0);
      expect(managerNotifications.length).toBeGreaterThan(0);
    });

    it('should filter notifications by status', async () => {
      const pendingNotifications = await Notification.findAll({
        where: { status: 'pending' }
      });

      expect(pendingNotifications.length).toBeGreaterThan(0);
      pendingNotifications.forEach(notification => {
        expect(notification.status).toBe('pending');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle notification creation failures', async () => {
      try {
        await Notification.create({
          // Missing required fields
          type: 'facilitator_reminder'
          // recipientId missing
          // title missing
          // message missing
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid notification types', async () => {
      try {
        await Notification.create({
          type: 'invalid_type',
          recipientId: testData.facilitator.id,
          title: 'Test',
          message: 'Test message'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});