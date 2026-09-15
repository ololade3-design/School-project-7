const LectureRoom = require('../models/LectureRoom');
const { createCrudController } = require('../utils/controllerUtils');

const crud = createCrudController({ Model: LectureRoom, resourceName: 'Lecture room', populate: 'department' });

module.exports = {
  getLectureRooms: crud.getAll,
  getLectureRoomById: crud.getById,
  createLectureRoom: crud.create,
  updateLectureRoom: crud.update,
  deleteLectureRoom: crud.remove
};
