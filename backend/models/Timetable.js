const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.Mixed, ref: 'Course' },
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    courseTitle: { type: String, required: true, trim: true },
    lecturer: { type: mongoose.Schema.Types.Mixed, ref: 'Lecturer' },
    department: { type: mongoose.Schema.Types.Mixed, ref: 'Department' },
    level: { type: String, required: true, trim: true },
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    lectureRoom: { type: mongoose.Schema.Types.Mixed, ref: 'LectureRoom' },
    semester: { type: String, required: true, trim: true },
    academicSession: { type: String, required: true, trim: true },
    status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);
