"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPharmacyAdmins = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const admin_service_1 = __importDefault(require("../../services/admin.service"));
const getPharmacyAdmins = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const admins = await admin_service_1.default.getAdminsByPharmacy(pharmacyId);
    const formatted = admins.map(admin => ({
        _id: admin._id,
        user: {
            _id: admin.user._id,
            username: admin.user.username,
            email: admin.user.email,
            role: admin.user.role,
        },
        permissions: admin.permissions,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
    }));
    res.json(formatted);
});
exports.getPharmacyAdmins = getPharmacyAdmins;
