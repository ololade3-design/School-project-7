const Lecturer = require('../models/Lecturer');
const { createCrudController } = require('../utils/controllerUtils');

const crud = createCrudController({ Model: Lecturer, resourceName: 'Lecturer', populate: 'userId courses' });

module.exports = {
  getLecturers: crud.getAll,
  getLecturerById: crud.getById,
  createLecturer: crud.create,
  updateLecturer: crud.update,
  deleteLecturer: crud.remove
};
