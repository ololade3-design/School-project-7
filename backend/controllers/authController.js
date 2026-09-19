const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isValidId, handleControllerError } = require('../utils/controllerUtils');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordIsValid = (password) => typeof password === 'string' && password.length >= 8;
const safeUser = (user) => ({
  id: String(user._id),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Full name, email, password, and role are required.' });
    }
    if (!emailPattern.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!passwordIsValid(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
    if (!['student', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role.' });
    }
    if (role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be created through public registration.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, email: normalizedEmail, password: hashedPassword, role });
    return res.status(201).json({ success: true, message: 'Registration successful.', data: { user: safeUser(user) } });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Authentication is not configured.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account is inactive.' });
    }

    const token = jwt.sign(
      { userId: String(user._id), role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { token, user: safeUser(user) }
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!isValidId(req.user.userId)) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Authentication is no longer valid.' });
    }
    return res.status(200).json({ success: true, message: 'Current user retrieved successfully.', data: { user: safeUser(user) } });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }
    if (!passwordIsValid(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user.userId).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Authentication is no longer valid.' });
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.status(200).json({ success: true, message: 'Password changed successfully.', data: { user: safeUser(user) } });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

module.exports = { register, login, getCurrentUser, changePassword };
