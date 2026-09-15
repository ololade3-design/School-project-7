const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const Student = require('../models/Student');
const { isValidId, sendInvalidId, handleControllerError } = require('../utils/controllerUtils');

const getCourseRegistrations = async (req, res) => {
  try {
    const registrations = await CourseRegistration.find().populate('student course');
    return res.status(200).json({ success: true, message: 'Course registrations retrieved successfully.', data: registrations });
  } catch (error) { return handleControllerError(error, res); }
};

const getCourseRegistrationById = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const registration = await CourseRegistration.findById(req.params.id).populate('student course');
    if (!registration) return res.status(404).json({ success: false, message: 'Course registration not found.' });
    return res.status(200).json({ success: true, message: 'Course registration retrieved successfully.', data: registration });
  } catch (error) { return handleControllerError(error, res); }
};

const verifyReferences = async ({ student, course }, res) => {
  if (!isValidId(student) || !isValidId(course)) { sendInvalidId(res); return false; }
  const [studentExists, courseExists] = await Promise.all([Student.exists({ _id: student }), Course.exists({ _id: course })]);
  if (!studentExists || !courseExists) {
    res.status(404).json({ success: false, message: !studentExists ? 'Student not found.' : 'Course not found.' });
    return false;
  }
  return true;
};

const createCourseRegistration = async (req, res) => {
  try {
    const { student, course, academicSession, semester } = req.body;
    if (!student || !course || !academicSession || !semester) return res.status(400).json({ success: false, message: 'Student, course, academic session, and semester are required.' });
    if (!(await verifyReferences({ student, course }, res))) return;
    const duplicate = await CourseRegistration.exists({ student, course, academicSession, semester });
    if (duplicate) return res.status(409).json({ success: false, message: 'This course registration already exists.' });
    const registration = await CourseRegistration.create(req.body);
    return res.status(201).json({ success: true, message: 'Course registration created successfully.', data: registration });
  } catch (error) { return handleControllerError(error, res); }
};

const updateCourseRegistration = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const current = await CourseRegistration.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Course registration not found.' });
    const candidate = { ...current.toObject(), ...req.body };
    if (!(await verifyReferences(candidate, res))) return;
    const duplicate = await CourseRegistration.exists({ student: candidate.student, course: candidate.course, academicSession: candidate.academicSession, semester: candidate.semester, _id: { $ne: current._id } });
    if (duplicate) return res.status(409).json({ success: false, message: 'This course registration already exists.' });
    const registration = await CourseRegistration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return res.status(200).json({ success: true, message: 'Course registration updated successfully.', data: registration });
  } catch (error) { return handleControllerError(error, res); }
};

const deleteCourseRegistration = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const registration = await CourseRegistration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: 'Course registration not found.' });
    return res.status(200).json({ success: true, message: 'Course registration deleted successfully.', data: registration });
  } catch (error) { return handleControllerError(error, res); }
};

module.exports = { getCourseRegistrations, getCourseRegistrationById, createCourseRegistration, updateCourseRegistration, deleteCourseRegistration };
