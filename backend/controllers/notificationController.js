const Notification = require('../models/Notification');
const { isValidId, sendInvalidId, handleControllerError } = require('../utils/controllerUtils');

const getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.recipient) {
      if (!isValidId(req.query.recipient)) return sendInvalidId(res);
      filter.recipient = req.query.recipient;
    }
    if (req.query.recipientRole) filter.recipientRole = req.query.recipientRole;
    const notifications = await Notification.find(filter).populate('recipient').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Notifications retrieved successfully.', data: notifications });
  } catch (error) { return handleControllerError(error, res); }
};

const getNotificationById = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const notification = await Notification.findById(req.params.id).populate('recipient');
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.status(200).json({ success: true, message: 'Notification retrieved successfully.', data: notification });
  } catch (error) { return handleControllerError(error, res); }
};

const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    return res.status(201).json({ success: true, message: 'Notification created successfully.', data: notification });
  } catch (error) { return handleControllerError(error, res); }
};

const markNotificationAsRead = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.status(200).json({ success: true, message: 'Notification marked as read.', data: notification });
  } catch (error) { return handleControllerError(error, res); }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const filter = {};
    if (req.query.recipient) {
      if (!isValidId(req.query.recipient)) return sendInvalidId(res);
      filter.recipient = req.query.recipient;
    }
    if (req.query.recipientRole) filter.recipientRole = req.query.recipientRole;
    const result = await Notification.updateMany(filter, { read: true });
    return res.status(200).json({ success: true, message: 'Notifications marked as read.', data: { modifiedCount: result.modifiedCount } });
  } catch (error) { return handleControllerError(error, res); }
};

const deleteNotification = async (req, res) => {
  if (!isValidId(req.params.id)) return sendInvalidId(res);
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.status(200).json({ success: true, message: 'Notification deleted successfully.', data: notification });
  } catch (error) { return handleControllerError(error, res); }
};

module.exports = { getNotifications, getNotificationById, createNotification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification };
