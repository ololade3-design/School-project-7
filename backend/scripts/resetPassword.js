#!/usr/bin/env node
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const [,, email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error('Usage: node resetPassword.js <email> <newPassword>');
  process.exit(1);
}

(async () => {
  try {
    const { MONGODB_URI } = process.env;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not set. Export it or add it to a .env file.');

    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const normalized = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalized }).select('+password');
    if (!user) {
      console.error('User not found:', normalized);
      process.exit(2);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    console.log('Password updated for', user.email);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err.message || err);
    try { if (mongoose.connection.readyState) await mongoose.connection.close(); } catch {};
    process.exit(1);
  }
})();
