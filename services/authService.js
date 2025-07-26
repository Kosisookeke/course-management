const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwt');

const register = async (email, password, role) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = await User.create({ email, password, role });
  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id);
  return { token, user };
};

module.exports = { register, login };