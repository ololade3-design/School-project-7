const CourseMaterial = require('../models/CourseMaterial');
const { createCrudController } = require('../utils/controllerUtils');

const crud = createCrudController({ Model: CourseMaterial, resourceName: 'Course material', populate: 'lecturer course' });

module.exports = {
  getCourseMaterials: crud.getAll,
  getCourseMaterialById: crud.getById,
  createCourseMaterial: crud.create,
  updateCourseMaterial: crud.update,
  deleteCourseMaterial: crud.remove
};
