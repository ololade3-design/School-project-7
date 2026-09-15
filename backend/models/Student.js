const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matricNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    // Accepts a Department ObjectId or the legacy department-name string.
    department: { type: mongoose.Schema.Types.Mixed, ref: 'Department' },
    faculty: { type: String, trim: true },
    level: { type: String, trim: true },
    academicSession: { type: String, trim: true },
    semester: { type: String, trim: true },
    registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    status: { type: String, enum: ['active', 'inactive', 'graduated'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
