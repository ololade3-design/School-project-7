const { buildTimetableOptions } = require('../utils/timetableConfig');
const { analyzeTimetableConflicts } = require('../utils/timetableConflict');

const normalizeReference = (value) => {
  if (!value && value !== 0) return '';
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
    return '';
  }
  return String(value).trim();
};

const sameReference = (left, right) => {
  const leftValue = normalizeReference(left);
  const rightValue = normalizeReference(right);
  return leftValue && rightValue && leftValue === rightValue;
};

const getLecturerOptions = (course, lecturers, departmentId) => {
  if (!lecturers.length) return [];
  const preferred = [];
  const fallback = [];

  lecturers.forEach((lecturer) => {
    const departmentMatches = departmentId ? sameReference(lecturer.department, departmentId) : true;
    const courseMatches = course && course.lecturer ? sameReference(lecturer._id, course.lecturer) || sameReference(lecturer.fullName, course.lecturer) : false;

    if (courseMatches && departmentMatches) preferred.push(lecturer);
    else if (departmentMatches) fallback.push(lecturer);
  });

  return preferred.length ? preferred : fallback;
};

const getRoomOptions = (course, rooms) => {
  const capacityValue = Number(course?.expectedStudents || course?.studentDemand || 0);

  if (!rooms.length) return [];
  return rooms.filter((room) => {
    const capacity = Number(room?.capacity || 0);
    if (!capacityValue) return true;
    return capacity >= capacityValue;
  });
};

const getDayIndex = (day) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(day);

const dayBalancePenalty = (day) => {
  const index = getDayIndex(day);
  return index * 2;
};

const scoreAssignment = ({
  day,
  lecturerCountOnDay = 0,
  sameDepartmentLevelOnDay = 0,
  roomChangePenalty = 0,
  roomCapacityScore = 0,
  sameLecturerPenalty = 0
}) => {
  return lecturerCountOnDay * 6 + sameDepartmentLevelOnDay * 9 + roomChangePenalty * 3 + sameLecturerPenalty * 10 + dayBalancePenalty(day) - roomCapacityScore * 2;
};

const chooseBestAssignment = ({ course, departmentId, level, semester, academicSession, lecturers, rooms, existingEntries, scheduledEntries }) => {
  const bestCandidates = [];
  const lecturerPool = getLecturerOptions(course, lecturers, departmentId);
  const roomPool = getRoomOptions(course, rooms);
  const options = buildTimetableOptions();

  for (const day of options.days) {
    const lecturerCountOnDay = scheduledEntries.filter((entry) => entry.day === day && sameReference(entry.lecturer, departmentId) === false).length;
    const sameDepartmentLevelOnDay = scheduledEntries.filter((entry) => entry.day === day && entry.department && level && entry.level === String(level)).length;

    for (const slot of options.slots) {
      const candidateBase = {
        day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        course: course._id || course.id || course.courseCode,
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        department: departmentId,
        level: String(level),
        semester,
        academicSession,
        status: 'scheduled'
      };

      for (const lecturer of lecturerPool) {
        for (const room of roomPool) {
          const candidate = {
            ...candidateBase,
            lecturer: lecturer._id || lecturer.id || lecturer.fullName,
            lectureRoom: room._id || room.id || room.roomName
          };

          const conflicts = analyzeTimetableConflicts(candidate, [...existingEntries, ...scheduledEntries]);
          if (conflicts.length > 0) continue;

          const roomCapacityScore = room?.capacity ? Number(room.capacity) : 0;
          const sameLecturerPenalty = scheduledEntries.filter((entry) => entry.day === day && sameReference(entry.lecturer, candidate.lecturer)).length;

          bestCandidates.push({
            entry: candidate,
            score: scoreAssignment({
              day,
              lecturerCountOnDay,
              sameDepartmentLevelOnDay,
              roomChangePenalty: scheduledEntries.some((entry) => sameReference(entry.lectureRoom, candidate.lectureRoom)) ? 1 : 0,
              roomCapacityScore,
              sameLecturerPenalty
            })
          });
        }
      }
    }
  }

  if (!bestCandidates.length) return null;
  bestCandidates.sort((left, right) => left.score - right.score);
  return bestCandidates[0];
};

const generateTimetableProposal = ({ courses = [], lecturers = [], rooms = [], departmentId, level, semester, academicSession, existingEntries = [] }) => {
  const scheduledEntries = [];
  const unscheduled = [];

  const orderedCourses = [...courses].sort((left, right) => {
    const leftUnits = Number(left.units || 0);
    const rightUnits = Number(right.units || 0);
    return rightUnits - leftUnits;
  });

  for (const course of orderedCourses) {
    const assignment = chooseBestAssignment({
      course,
      departmentId,
      level,
      semester,
      academicSession,
      lecturers,
      rooms,
      existingEntries,
      scheduledEntries
    });

    if (!assignment) {
      unscheduled.push({
        course: course.courseCode || course.courseTitle || 'Unknown course',
        reason: 'No conflict-free time slot and room were available.'
      });
      continue;
    }

    scheduledEntries.push(assignment.entry);
  }

  return {
    scheduled: scheduledEntries,
    unscheduled,
    options: buildTimetableOptions()
  };
};

module.exports = {
  generateTimetableProposal,
  scoreAssignment,
  buildTimetableOptions,
  normalizeReference
};
