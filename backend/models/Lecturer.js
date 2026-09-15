const mongoose = require('mongoose');

const lecturerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staffId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: mongoose.Schema.Types.Mixed, ref: 'Department' },
    faculty: { type: String, trim: true },
    qualification: { type: String, trim: true },
    specialization: { type: String, trim: true },
    position: { type: String, trim: true },
    employmentType: { type: String, trim: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Lecturer || mongoose.model('Lecturer', lecturerSchema);
