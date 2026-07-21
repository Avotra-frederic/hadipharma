"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyRole = exports.notifySuperAdmins = exports.notifyPharmacyAdmins = exports.notifyUsers = exports.emitNotification = void 0;
const notification_bus_1 = require("../core/notification-bus");
const admin_service_1 = __importDefault(require("./admin.service"));
const user_model_1 = __importDefault(require("../app/model/user.model"));
const emitNotification = (event, payload) => {
    notification_bus_1.notificationBus.emit(event, payload);
};
exports.emitNotification = emitNotification;
const notifyUsers = (userIds, event, payload) => {
    [...new Set(userIds.filter((id) => Boolean(id)))].forEach((userId) => {
        (0, exports.emitNotification)(event, { ...payload, userId });
    });
};
exports.notifyUsers = notifyUsers;
const notifyPharmacyAdmins = async (pharmacyId, event, payload) => {
    const admins = await admin_service_1.default.getAdminsByPharmacy(pharmacyId);
    (0, exports.notifyUsers)(admins.filter((admin) => admin.active).map((admin) => admin.user?._id?.toString()), event, { ...payload, pharmacyId });
};
exports.notifyPharmacyAdmins = notifyPharmacyAdmins;
const notifySuperAdmins = async (event, payload) => {
    const superAdmins = await user_model_1.default.find({ role: 'superadmin', isActive: { $ne: false } }).select('_id');
    (0, exports.notifyUsers)(superAdmins.map((user) => user._id.toString()), event, payload);
};
exports.notifySuperAdmins = notifySuperAdmins;
const notifyRole = async (role, event, payload) => {
    const users = await user_model_1.default.find({ role, isActive: { $ne: false } }).select('_id');
    (0, exports.notifyUsers)(users.map((user) => user._id.toString()), event, payload);
};
exports.notifyRole = notifyRole;
