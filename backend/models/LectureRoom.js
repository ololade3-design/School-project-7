const mongoose = require('mongoose');

const lectureRoomSchema = new mongoose.Schema(
  {
    roomName: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true, uppercase: true },
    building: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    department: { type: mongoose.Schema.Types.Mixed, ref: 'Department' },
    status: { type: String, enum: ['available', 'unavailable', 'maintenance'], default: 'available' }
  },
  { timestamps: true }
);

lectureRoomSchema.index({ roomNumber: 1, building: 1 }, { unique: true });

module.exports = mongoose.models.LectureRoom || mongoose.model('LectureRoom', lectureRoomSchema);
