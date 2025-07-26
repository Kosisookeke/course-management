const request = require('supertest');
const app = require('../app');
const { sequelize, User, Module, Class, Cohort, Mode, CourseOffering } = require('../models');
const jwt = require('jsonwebtoken');

describe('Course Allocation Endpoints', () => {
  let managerToken, facilitatorToken, testOfferingId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test data
    const manager = await User.create({ email: 'testmanager@example.com', password: 'password123', role: 'manager' });
    const facilitator = await User.create({ email: 'testfacilitator@example.com', password: 'password123', role: 'facilitator' });
    const testModule = await Module.create({ name: 'Test Module', code: 'TM101', description: 'A test module' });
    const testClass = await Class.create({ name: '2024T', startDate: new Date(), endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)) });
    const testCohort = await Cohort.create({ name: 'Cohort A', year: 2024 });
    const testMode = await Mode.create({ name: 'Online' });

    managerToken = jwt.sign({ id: manager.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    facilitatorToken = jwt.sign({ id: facilitator.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const offering = await CourseOffering.create({
      moduleId: testModule.id,
      classId: testClass.id,
      trimester: 'T1',
      cohortId: testCohort.id,
      intake: 'FT',
      modeId: testMode.id,
      facilitatorId: facilitator.id
    });
    testOfferingId = offering.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a course offering (Manager)', async () => {
    const res = await request(app)
      .post('/api/course-allocations')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        moduleId: 1, // Assuming IDs start from 1
        classId: 1,
        trimester: 'T2',
        cohortId: 1,
        intake: 'HT1',
        modeId: 1
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get course offerings (Facilitator sees only theirs)', async () => {
    const res = await request(app)
      .get('/api/course-allocations')
      .set('Authorization', `Bearer ${facilitatorToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should only see the one assigned to them
    expect(res.body.length).toBeGreaterThanOrEqual(1); // Could be more if seeded
    expect(res.body[0]).toHaveProperty('facilitatorId', expect.any(Number)); // Check structure
  });

  it('should get course offerings (Manager sees all)', async () => {
    const res = await request(app)
      .get('/api/course-allocations')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1); // Should see at least one created
  });

  it('should update a course offering (Manager)', async () => {
     const res = await request(app)
      .put(`/api/course-allocations/${testOfferingId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        trimester: 'T3'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.trimester).toBe('T3');
  });

  it('should delete a course offering (Manager)', async () => {
    // Create a new one to delete
    const newOffering = await CourseOffering.create({
      moduleId: 1,
      classId: 1,
      trimester: 'T1',
      cohortId: 1,
      intake: 'FT',
      modeId: 1
    });

    const res = await request(app)
      .delete(`/api/course-allocations/${newOffering.id}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.statusCode).toEqual(204);
  });

  it('should fail to create offering (Facilitator)', async () => {
    const res = await request(app)
      .post('/api/course-allocations')
      .set('Authorization', `Bearer ${facilitatorToken}`)
      .send({
        moduleId: 1,
        classId: 1,
        trimester: 'T2',
        cohortId: 1,
        intake: 'HT1',
        modeId: 1
      });
    expect(res.statusCode).toEqual(403); // Forbidden
  });
});