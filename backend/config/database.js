const mongoose = require('mongoose');

const connectDatabase = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and set it.');
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

module.exports = connectDatabase;
