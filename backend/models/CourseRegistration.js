const mongoose = require('mongoose');

const courseRegistrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    academicSession: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['registered', 'dropped', 'pending'], default: 'registered' }
  },
  { timestamps: true }
);

courseRegistrationSchema.index(
  { student: 1, course: 1, academicSession: 1, semester: 1 },
  { unique: true }
);

module.exports = mongoose.models.CourseRegistration || mongoose.model('CourseRegistration', courseRegistrationSchema);
