const { User } = require('../models');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  it('should hash the password before saving', async () => {
    const user = await User.create({
      email: 'testhash@example.com',
      password: 'mypassword',
      role: 'student'
    });

    expect(user.password).not.toBe('mypassword');
    const isMatch = await bcrypt.compare('mypassword', user.password);
    expect(isMatch).toBe(true);
  });

  it('should compare password correctly', async () => {
    const user = await User.create({
      email: 'testcompare@example.com',
      password: 'anotherpassword',
      role: 'facilitator'
    });

    const isMatch = await user.comparePassword('anotherpassword');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });
});