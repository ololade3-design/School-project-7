const express = require('express');
const controller = require('../controllers/lecturerController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, authorizeRoles('admin'), controller.getLecturers).post(authenticateToken, authorizeRoles('admin'), controller.createLecturer);
router.route('/:id').get(authenticateToken, authorizeRoles('admin', 'lecturer'), controller.getLecturerById).put(authenticateToken, authorizeRoles('admin'), controller.updateLecturer).delete(authenticateToken, authorizeRoles('admin'), controller.deleteLecturer);

module.exports = router;
