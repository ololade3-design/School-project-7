const express = require('express');
const controller = require('../controllers/courseMaterialController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, controller.getCourseMaterials).post(authenticateToken, authorizeRoles('admin', 'lecturer'), controller.createCourseMaterial);
router.route('/:id').get(authenticateToken, controller.getCourseMaterialById).put(authenticateToken, authorizeRoles('admin', 'lecturer'), controller.updateCourseMaterial).delete(authenticateToken, authorizeRoles('admin', 'lecturer'), controller.deleteCourseMaterial);

module.exports = router;
