const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIMETABLE_SLOTS = [
  { label: '08:00 - 10:00', startTime: '08:00', endTime: '10:00' },
  { label: '10:00 - 12:00', startTime: '10:00', endTime: '12:00' },
  { label: '12:00 - 14:00', startTime: '12:00', endTime: '14:00' },
  { label: '14:00 - 16:00', startTime: '14:00', endTime: '16:00' },
  { label: '16:00 - 18:00', startTime: '16:00', endTime: '18:00' }
];

const buildTimetableOptions = () => ({
  days: [...TIMETABLE_DAYS],
  slots: TIMETABLE_SLOTS.map((slot) => ({ ...slot }))
});

module.exports = {
  TIMETABLE_DAYS,
  TIMETABLE_SLOTS,
  buildTimetableOptions
};
