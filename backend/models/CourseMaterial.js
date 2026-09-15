const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema(
  {
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['PDF', 'document', 'video', 'link', 'note', 'other', 'Lecture Note', 'Assignment', 'Tutorial', 'Past Question', 'Reference', 'Other']
    },
    description: { type: String, trim: true },
    link: { type: String, trim: true },
    status: { type: String, enum: ['published', 'draft', 'archived', 'Shared', 'Draft'], default: 'published' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.CourseMaterial || mongoose.model('CourseMaterial', courseMaterialSchema);
