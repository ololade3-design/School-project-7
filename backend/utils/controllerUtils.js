const mongoose = require('mongoose');

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendInvalidId = (res) => res.status(400).json({
  success: false,
  message: 'Invalid MongoDB document ID.'
});

const handleControllerError = (error, res) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid request data.' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with this value already exists.' });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
};

const createCrudController = ({ Model, resourceName, populate }) => {
  const applyPopulate = (query) => (populate ? query.populate(populate) : query);

  const getAll = async (req, res) => {
    try {
      const documents = await applyPopulate(Model.find());
      return res.status(200).json({ success: true, message: `${resourceName} retrieved successfully.`, data: documents });
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  const getById = async (req, res) => {
    if (!isValidId(req.params.id)) return sendInvalidId(res);
    try {
      const document = await applyPopulate(Model.findById(req.params.id));
      if (!document) return res.status(404).json({ success: false, message: `${resourceName} not found.` });
      return res.status(200).json({ success: true, message: `${resourceName} retrieved successfully.`, data: document });
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  const create = async (req, res) => {
    try {
      const document = await Model.create(req.body);
      return res.status(201).json({ success: true, message: `${resourceName} created successfully.`, data: document });
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  const update = async (req, res) => {
    if (!isValidId(req.params.id)) return sendInvalidId(res);
    try {
      const document = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!document) return res.status(404).json({ success: false, message: `${resourceName} not found.` });
      return res.status(200).json({ success: true, message: `${resourceName} updated successfully.`, data: document });
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  const remove = async (req, res) => {
    if (!isValidId(req.params.id)) return sendInvalidId(res);
    try {
      const document = await Model.findByIdAndDelete(req.params.id);
      if (!document) return res.status(404).json({ success: false, message: `${resourceName} not found.` });
      return res.status(200).json({ success: true, message: `${resourceName} deleted successfully.`, data: document });
    } catch (error) {
      return handleControllerError(error, res);
    }
  };

  return { getAll, getById, create, update, remove };
};

module.exports = { isValidId, sendInvalidId, handleControllerError, createCrudController };
