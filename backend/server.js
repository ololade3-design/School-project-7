require('dotenv').config();

const cors = require('cors');
const express = require('express');
const connectDatabase = require('./config/database');
require('./models');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lectureRoomRoutes = require('./routes/lectureRoomRoutes');
const courseRegistrationRoutes = require('./routes/courseRegistrationRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseMaterialRoutes = require('./routes/courseMaterialRoutes');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Timetable API is running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lecture-rooms', lectureRoomRoutes);
app.use('/api/course-registrations', courseRegistrationRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/course-materials', courseMaterialRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, message: 'Invalid JSON request body.' });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Smart Timetable API listening on port ${port}`);
    });
  } catch (error) {
    console.error(`Unable to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
