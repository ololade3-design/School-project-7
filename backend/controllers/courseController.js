const Course = require('../models/Course');
const { createCrudController } = require('../utils/controllerUtils');

const crud = createCrudController({ Model: Course, resourceName: 'Course', populate: 'department lecturer' });

module.exports = {
  getCourses: crud.getAll,
  getCourseById: crud.getById,
  createCourse: crud.create,
  updateCourse: crud.update,
  deleteCourse: crud.remove
};
