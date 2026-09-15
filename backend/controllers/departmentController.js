const Department = require('../models/Department');
const { createCrudController } = require('../utils/controllerUtils');

const crud = createCrudController({ Model: Department, resourceName: 'Department' });

module.exports = {
  getDepartments: crud.getAll,
  getDepartmentById: crud.getById,
  createDepartment: crud.create,
  updateDepartment: crud.update,
  deleteDepartment: crud.remove
};
