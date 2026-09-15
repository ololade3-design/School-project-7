require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env.');
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();
    await connectDatabase();

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('An account with the configured admin email already exists; no admin was created.');
      return;
    }

    const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({ fullName: ADMIN_NAME.trim(), email, password, role: 'admin', isActive: true });
    console.log('Default admin account created successfully.');
  } catch (error) {
    console.error(`Unable to create default admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

createAdmin();
