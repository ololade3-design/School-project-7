const normalize = (value) => (value === undefined || value === null ? '' : String(value).trim().toLowerCase());

const normalizeReference = (value) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
    return '';
  }
  return String(value).trim();
};

const timeToMinutes = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (minutes > 59 || hours > 23 || (!meridiem && hours > 23) || (meridiem && (hours < 1 || hours > 12))) return null;
  if (meridiem) hours = (hours % 12) + (meridiem === 'pm' ? 12 : 0);
  return hours * 60 + minutes;
};

const timesOverlap = (startA, endA, startB, endB) => {
  const values = [startA, endA, startB, endB].map(timeToMinutes);
  if (values.some((value) => value === null)) return false;
  const [aStart, aEnd, bStart, bEnd] = values;
  return aStart < bEnd && bStart < aEnd;
};

const buildConflict = (type, message) => ({ type, message });

const analyzeTimetableConflicts = (entry, existingEntries = []) => {
  if (!entry) return [];

  const current = {
    ...entry,
    day: entry.day,
    startTime: entry.startTime,
    endTime: entry.endTime,
    lecturer: normalizeReference(entry.lecturer),
    department: normalizeReference(entry.department),
    level: entry.level ? String(entry.level).trim() : '',
    courseCode: entry.courseCode ? String(entry.courseCode).trim().toUpperCase() : '',
    lectureRoom: normalizeReference(entry.lectureRoom),
    semester: entry.semester ? String(entry.semester).trim() : '',
    academicSession: entry.academicSession ? String(entry.academicSession).trim() : ''
  };

  const conflicts = [];

  existingEntries.forEach((existing) => {
    if (!existing || existing.status === 'cancelled') return;
    if (!timesOverlap(current.startTime, current.endTime, existing.startTime, existing.endTime)) return;
    if (current.day && existing.day && current.day !== existing.day) return;
    if (current.academicSession && existing.academicSession && current.academicSession !== existing.academicSession) return;
    if (current.semester && existing.semester && current.semester !== existing.semester) return;

    const sameLecturer = current.lecturer && normalize(current.lecturer) && normalize(existing.lecturer) && normalize(current.lecturer) === normalize(existing.lecturer);
    if (sameLecturer) {
      conflicts.push(buildConflict('LECTURER', 'Lecturer is already teaching another course at this time.'));
    }

    const sameRoom = current.lectureRoom && normalize(current.lectureRoom) && normalize(existing.lectureRoom) && normalize(current.lectureRoom) === normalize(existing.lectureRoom);
    if (sameRoom) {
      conflicts.push(buildConflict('ROOM', 'Lecture room is already occupied during this period.'));
    }

    const sameCohort = current.department && current.level && existing.department && existing.level
      && normalize(current.department) === normalize(existing.department)
      && normalize(current.level) === normalize(existing.level);
    if (sameCohort) {
      conflicts.push(buildConflict('DEPARTMENT_LEVEL', 'Level students already have a course scheduled during this period.'));
    }

    const sameCourse = current.courseCode && existing.courseCode
      && normalize(current.courseCode) === normalize(existing.courseCode)
      && normalize(current.department) === normalize(existing.department)
      && normalize(current.level) === normalize(existing.level)
      && normalize(current.semester) === normalize(existing.semester)
      && normalize(current.academicSession) === normalize(existing.academicSession);
    if (sameCourse) {
      conflicts.push(buildConflict('COURSE', 'Course is already scheduled for this department, level, semester, and session.'));
    }
  });

  const uniqueConflicts = [];
  const seen = new Set();
  conflicts.forEach((conflict) => {
    const key = `${conflict.type}:${conflict.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueConflicts.push(conflict);
    }
  });

  return uniqueConflicts;
};

const hasTimetableConflict = (entry, existingEntries) => analyzeTimetableConflicts(entry, existingEntries).length > 0;

module.exports = { timeToMinutes, timesOverlap, hasTimetableConflict, analyzeTimetableConflicts, normalizeReference };
