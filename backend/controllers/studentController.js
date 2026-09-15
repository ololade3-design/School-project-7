const Student = require('../models/Student');
const { createCrudController } = require('../utils/controllerUtils');

const crud = createCrudController({ Model: Student, resourceName: 'Student', populate: 'userId registeredCourses' });

module.exports = {
  getStudents: crud.getAll,
  getStudentById: crud.getById,
  createStudent: crud.create,
  updateStudent: crud.update,
  deleteStudent: crud.remove
};
