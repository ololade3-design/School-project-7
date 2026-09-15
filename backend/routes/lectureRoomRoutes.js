const express = require('express');
const controller = require('../controllers/lectureRoomController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, controller.getLectureRooms).post(authenticateToken, authorizeRoles('admin'), controller.createLectureRoom);
router.route('/:id').get(authenticateToken, controller.getLectureRoomById).put(authenticateToken, authorizeRoles('admin'), controller.updateLectureRoom).delete(authenticateToken, authorizeRoles('admin'), controller.deleteLectureRoom);

module.exports = router;
