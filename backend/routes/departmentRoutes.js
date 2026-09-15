const express = require('express');
const controller = require('../controllers/departmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(authenticateToken, controller.getDepartments).post(authenticateToken, authorizeRoles('admin'), controller.createDepartment);
router.route('/:id').get(authenticateToken, controller.getDepartmentById).put(authenticateToken, authorizeRoles('admin'), controller.updateDepartment).delete(authenticateToken, authorizeRoles('admin'), controller.deleteDepartment);

module.exports = router;
