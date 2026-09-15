const express = require('express');
const controller = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, authorizeRoles('admin'), controller.getStudents).post(authenticateToken, authorizeRoles('admin'), controller.createStudent);
router.route('/:id').get(authenticateToken, authorizeRoles('admin', 'student', 'lecturer'), controller.getStudentById).put(authenticateToken, authorizeRoles('admin'), controller.updateStudent).delete(authenticateToken, authorizeRoles('admin'), controller.deleteStudent);

module.exports = router;
