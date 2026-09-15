const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Lecturer = require('../models/Lecturer');
const Department = require('../models/Department');
const LectureRoom = require('../models/LectureRoom');
const { isValidId, sendInvalidId, handleControllerError } = require('../utils/controllerUtils');
const { timeToMinutes, analyzeTimetableConflicts } = require('../utils/timetableConflict');
const { generateTimetableProposal } = require('../services/timetableGenerator');

const populate = (query) => query.populate('course lecturer department lectureRoom');

const getTimetable = async (req, res) => {
  try {
    const entries = await populate(Timetable.find().sort({ day: 1, startTime: 1 }));
    return res.status(200).json({ success: true, message: 'Timetable entries retrieved successfully.', data: entries });
  } catch (error) { return handleControllerError(error, res); }
};

const getTimetableById = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const entry = await populate(Timetable.findById(req.params.id));
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    return res.status(200).json({ success: true, message: 'Timetable entry retrieved successfully.', data: entry });
  } catch (error) { return handleControllerError(error, res); }
};

const validateTimes = (entry, res) => {
  const start = timeToMinutes(entry.startTime);
  const end = timeToMinutes(entry.endTime);
  if (start === null || end === null || start >= end) {
    res.status(400).json({ success: false, message: 'startTime and endTime must be valid times, with endTime after startTime.' });
    return false;
  }
  return true;
};

const validateTimetableEntry = async (entry, res) => {
  if (!entry) return false;
  if (!entry.day || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(entry.day)) {
    res.status(400).json({ success: false, message: 'A valid day is required.' });
    return false;
  }
  if (!entry.startTime || !entry.endTime || !validateTimes(entry, res)) return false;
  if (!entry.semester || !entry.academicSession) {
    res.status(400).json({ success: false, message: 'semester and academicSession are required.' });
    return false;
  }
  if (!entry.course && !entry.courseCode) {
    res.status(400).json({ success: false, message: 'course or courseCode is required.' });
    return false;
  }

  const courseId = entry.course || entry.courseId;
  const lecturerId = entry.lecturer || entry.lecturerId;
  const departmentId = entry.department || entry.departmentId;
  const roomId = entry.lectureRoom || entry.lectureRoomId;

  if (courseId && !isValidId(courseId)) {
    res.status(400).json({ success: false, message: 'Invalid course ID.' });
    return false;
  }
  if (lecturerId && !isValidId(lecturerId)) {
    res.status(400).json({ success: false, message: 'Invalid lecturer ID.' });
    return false;
  }
  if (departmentId && !isValidId(departmentId)) {
    res.status(400).json({ success: false, message: 'Invalid department ID.' });
    return false;
  }
  if (roomId && !isValidId(roomId)) {
    res.status(400).json({ success: false, message: 'Invalid lecture room ID.' });
    return false;
  }

  const [courseExists, lecturerExists, departmentExists, roomExists] = await Promise.all([
    courseId ? Course.exists({ _id: courseId }) : true,
    lecturerId ? Lecturer.exists({ _id: lecturerId }) : true,
    departmentId ? Department.exists({ _id: departmentId }) : true,
    roomId ? LectureRoom.exists({ _id: roomId }) : true
  ]);

  if (courseId && !courseExists) {
    res.status(404).json({ success: false, message: 'Course not found.' });
    return false;
  }
  if (lecturerId && !lecturerExists) {
    res.status(404).json({ success: false, message: 'Lecturer not found.' });
    return false;
  }
  if (departmentId && !departmentExists) {
    res.status(404).json({ success: false, message: 'Department not found.' });
    return false;
  }
  if (roomId && !roomExists) {
    res.status(404).json({ success: false, message: 'Lecture room not found.' });
    return false;
  }

  if (entry.courseCode) entry.courseCode = String(entry.courseCode).trim().toUpperCase();
  if (entry.day) entry.day = String(entry.day).trim();
  if (entry.level) entry.level = String(entry.level).trim();

  return true;
};

const checkConflicts = async (entry, excludeId) => {
  const query = {
    day: entry.day,
    semester: entry.semester,
    academicSession: entry.academicSession,
    status: { $ne: 'cancelled' }
  };
  if (excludeId) query._id = { $ne: excludeId };
  const existingEntries = await Timetable.find(query).lean();
  return analyzeTimetableConflicts(entry, existingEntries);
};

const createTimetable = async (req, res) => {
  try {
    if (!await validateTimetableEntry(req.body, res)) return;
    const conflicts = await checkConflicts(req.body);
    if (conflicts.length) {
      return res.status(409).json({ success: false, message: 'Timetable conflict detected.', conflicts });
    }
    const entry = await Timetable.create(req.body);
    return res.status(201).json({ success: true, message: 'Timetable entry created successfully.', data: entry });
  } catch (error) { return handleControllerError(error, res); }
};

const updateTimetable = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const current = await Timetable.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    const candidate = { ...current.toObject(), ...req.body };
    if (!await validateTimetableEntry(candidate, res)) return;
    const conflicts = await checkConflicts(candidate, current._id);
    if (conflicts.length) {
      return res.status(409).json({ success: false, message: 'Timetable conflict detected.', conflicts });
    }
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return res.status(200).json({ success: true, message: 'Timetable entry updated successfully.', data: entry });
  } catch (error) { return handleControllerError(error, res); }
};

const deleteTimetable = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    return res.status(200).json({ success: true, message: 'Timetable entry deleted successfully.', data: entry });
  } catch (error) { return handleControllerError(error, res); }
};

const generateTimetable = async (req, res) => {
  try {
    const { departmentId, level, semester, academicSession } = req.body || {};
    if (!departmentId || !level || !semester || !academicSession) {
      return res.status(400).json({ success: false, message: 'departmentId, level, semester, and academicSession are required.' });
    }
    if (!isValidId(departmentId)) return sendInvalidId(res);

    const [department, allCourses, lecturers, rooms, existingEntries] = await Promise.all([
      Department.findById(departmentId),
      Course.find({ status: { $ne: 'inactive' } }).populate('department lecturer'),
      Lecturer.find({ status: { $ne: 'inactive' } }).populate('department'),
      LectureRoom.find({ status: { $ne: 'maintenance' } }).populate('department'),
      Timetable.find({ semester, academicSession, status: { $ne: 'cancelled' } }).populate('course lecturer department lectureRoom')
    ]);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const departmentCourses = allCourses.filter((course) => {
      const courseDepartment = course.department ? String(course.department._id || course.department) : '';
      const courseLevel = course.level ? String(course.level) : '';
      return courseDepartment === String(departmentId) && courseLevel === String(level);
    });

    if (!departmentCourses.length) {
      return res.status(200).json({
        success: true,
        message: 'No courses available for the selected department and level.',
        data: { scheduled: [], unscheduled: [], options: [] }
      });
    }

    const proposal = generateTimetableProposal({
      courses: departmentCourses,
      lecturers,
      rooms,
      departmentId,
      level,
      semester,
      academicSession,
      existingEntries
    });

    return res.status(200).json({
      success: true,
      message: 'Timetable preview generated successfully.',
      data: proposal
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const confirmGeneratedTimetable = async (req, res) => {
  try {
    const entries = Array.isArray(req.body?.entries)
      ? req.body.entries
      : Array.isArray(req.body?.generatedEntries)
        ? req.body.generatedEntries
        : Array.isArray(req.body?.schedule)
          ? req.body.schedule
          : [];

    if (!entries.length) {
      return res.status(400).json({ success: false, message: 'Generated timetable entries are required for confirmation.' });
    }

    const conflicts = [];
    const preparedEntries = [];

    for (const entry of entries) {
      const candidate = {
        ...entry,
        course: entry.course?._id || entry.course || entry.courseId,
        lecturer: entry.lecturer?._id || entry.lecturer || entry.lecturerId,
        department: entry.department?._id || entry.department || entry.departmentId,
        lectureRoom: entry.lectureRoom?._id || entry.lectureRoom || entry.lectureRoomId,
        courseCode: entry.courseCode || entry.course?.courseCode,
        courseTitle: entry.courseTitle || entry.course?.courseTitle,
      };

      if (!await validateTimetableEntry(candidate, res)) return;
      const existingConflicts = await checkConflicts(candidate);
      if (existingConflicts.length) {
        conflicts.push(...existingConflicts.map((item) => ({ ...item, entry: candidate })));
      }
      preparedEntries.push(candidate);
    }

    if (conflicts.length) {
      return res.status(409).json({ success: false, message: 'Timetable conflict detected.', conflicts });
    }

    const savedEntries = await Timetable.insertMany(preparedEntries);
    return res.status(201).json({ success: true, message: 'Generated timetable confirmed and saved successfully.', data: savedEntries });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

module.exports = { getTimetable, getTimetableById, createTimetable, updateTimetable, deleteTimetable, generateTimetable, confirmGeneratedTimetable };
