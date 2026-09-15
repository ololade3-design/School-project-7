require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const models = require('../models');

const verifyModels = async () => {
  try {
    console.log(`Loaded models: ${Object.keys(models).join(', ')}`);
    await connectDatabase();
    console.log('All Mongoose models compiled and MongoDB connection succeeded.');
    await mongoose.connection.close();
  } catch (error) {
    console.error(`Model verification failed: ${error.message}`);
    process.exitCode = 1;
  }
};

verifyModels();
