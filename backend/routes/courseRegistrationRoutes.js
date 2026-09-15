const express = require('express');
const controller = require('../controllers/courseRegistrationController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, authorizeRoles('admin', 'student', 'lecturer'), controller.getCourseRegistrations).post(authenticateToken, authorizeRoles('admin', 'student'), controller.createCourseRegistration);
router.route('/:id').get(authenticateToken, authorizeRoles('admin', 'student', 'lecturer'), controller.getCourseRegistrationById).put(authenticateToken, authorizeRoles('admin', 'student'), controller.updateCourseRegistration).delete(authenticateToken, authorizeRoles('admin', 'student'), controller.deleteCourseRegistration);

module.exports = router;
