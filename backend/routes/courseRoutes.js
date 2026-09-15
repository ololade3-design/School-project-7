const express = require('express');
const controller = require('../controllers/courseController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, controller.getCourses).post(authenticateToken, authorizeRoles('admin'), controller.createCourse);
router.route('/:id').get(authenticateToken, controller.getCourseById).put(authenticateToken, authorizeRoles('admin'), controller.updateCourse).delete(authenticateToken, authorizeRoles('admin'), controller.deleteCourse);

module.exports = router;
