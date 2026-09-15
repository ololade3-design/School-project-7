const express = require('express');
const controller = require('../controllers/notificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, controller.getNotifications).post(authenticateToken, authorizeRoles('admin'), controller.createNotification);
router.put('/read-all', authenticateToken, controller.markAllNotificationsAsRead);
router.put('/:id/read', authenticateToken, controller.markNotificationAsRead);
router.route('/:id').get(authenticateToken, controller.getNotificationById).delete(authenticateToken, authorizeRoles('admin'), controller.deleteNotification);

module.exports = router;
