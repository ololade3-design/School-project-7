const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientRole: { type: String, required: true, enum: ['admin', 'lecturer', 'student'] },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['system', 'timetable', 'course', 'student', 'announcement', 'info', 'warning', 'success', 'danger'],
      default: 'system'
    },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
