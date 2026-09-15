const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    courseTitle: { type: String, required: true, trim: true },
    // These fields may contain a referenced document id or a legacy display string.
    department: { type: mongoose.Schema.Types.Mixed, ref: 'Department' },
    level: { type: String, required: true, trim: true },
    units: { type: Number, required: true, min: 0 },
    semester: { type: String, required: true, trim: true },
    lecturer: { type: mongoose.Schema.Types.Mixed, ref: 'Lecturer' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);
