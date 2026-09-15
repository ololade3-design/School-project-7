const test = require('node:test');
const assert = require('node:assert/strict');

const { timesOverlap, analyzeTimetableConflicts } = require('../utils/timetableConflict');
const { buildTimetableOptions, scoreAssignment } = require('../services/timetableGenerator');

const makeEntry = (overrides = {}) => ({
  day: 'Monday',
  startTime: '10:00',
  endTime: '12:00',
  lecturer: 'lecturer-1',
  department: 'department-1',
  level: '200',
  courseCode: 'COS201',
  lectureRoom: 'room-1',
  semester: 'First',
  academicSession: '2026/2027',
  ...overrides
});

test('boundary-touching times are not overlapping', () => {
  assert.equal(timesOverlap('10:00', '12:00', '12:00', '14:00'), false);
});

test('same lecturer at same overlapping time is rejected', () => {
  const conflict = analyzeTimetableConflicts(
    makeEntry({ lecturer: 'lecturer-1', lectureRoom: 'room-2', courseCode: 'COS202' }),
    [makeEntry({ lecturer: 'lecturer-1', lectureRoom: 'room-3', courseCode: 'COS201' })]
  );
  assert.ok(conflict.some((item) => item.type === 'LECTURER'));
});

test('same room at same overlapping time is rejected', () => {
  const conflict = analyzeTimetableConflicts(
    makeEntry({ lectureRoom: 'room-1', courseCode: 'COS202' }),
    [makeEntry({ lectureRoom: 'room-1', courseCode: 'COS201' })]
  );
  assert.ok(conflict.some((item) => item.type === 'ROOM'));
});

test('same department and level overlap is rejected', () => {
  const conflict = analyzeTimetableConflicts(
    makeEntry({ department: 'department-1', level: '200', courseCode: 'COS301', startTime: '10:00', endTime: '12:00' }),
    [makeEntry({ department: 'department-1', level: '200', courseCode: 'COS201', startTime: '11:00', endTime: '13:00' })]
  );
  assert.ok(conflict.some((item) => item.type === 'DEPARTMENT_LEVEL'));
});

test('same course in same session is rejected', () => {
  const conflict = analyzeTimetableConflicts(
    makeEntry({ courseCode: 'COS201', lecturer: 'lecturer-2', lectureRoom: 'room-2' }),
    [makeEntry({ courseCode: 'COS201', lecturer: 'lecturer-3', lectureRoom: 'room-3' })]
  );
  assert.ok(conflict.some((item) => item.type === 'COURSE'));
});

test('time slot options include the standard week structure', () => {
  const options = buildTimetableOptions();
  assert.deepEqual(options.days, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  assert.ok(options.slots.length >= 5);
});

test('assignment scoring prefers more balanced arrangements', () => {
  const first = scoreAssignment({
    day: 'Monday',
    lecturerCountOnDay: 2,
    sameDepartmentLevelOnDay: 1,
    roomChangePenalty: 0,
    roomCapacityScore: 10,
    sameLecturerPenalty: 0
  });
  const second = scoreAssignment({
    day: 'Friday',
    lecturerCountOnDay: 0,
    sameDepartmentLevelOnDay: 0,
    roomChangePenalty: 1,
    roomCapacityScore: 5,
    sameLecturerPenalty: 1
  });
  assert.ok(first < second);
});
