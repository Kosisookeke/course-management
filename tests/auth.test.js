const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
        role: 'facilitator'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('testuser@example.com');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('testuser@example.com');
  });

  it('should fail to login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toEqual(401);
  });
});