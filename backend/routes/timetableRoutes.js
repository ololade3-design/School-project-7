const express = require('express');
const controller = require('../controllers/timetableController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, controller.getTimetable).post(authenticateToken, authorizeRoles('admin'), controller.createTimetable);
router.post('/generate', authenticateToken, authorizeRoles('admin'), controller.generateTimetable);
router.post('/confirm', authenticateToken, authorizeRoles('admin'), controller.confirmGeneratedTimetable);
router.route('/:id').get(authenticateToken, controller.getTimetableById).put(authenticateToken, authorizeRoles('admin'), controller.updateTimetable).delete(authenticateToken, authorizeRoles('admin'), controller.deleteTimetable);

module.exports = router;
