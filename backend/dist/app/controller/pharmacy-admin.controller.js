"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePharmacyAdminActive = exports.updatePharmacyAdminPermissions = exports.removePharmacyUser = exports.updatePharmacyUserRole = exports.addPharmacyUser = exports.getPharmacyAdmins = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const admin_service_1 = __importDefault(require("../../services/admin.service"));
const user_model_1 = __importDefault(require("../../app/model/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const notification_service_1 = require("../../services/notification.service");
const jwt_utils_1 = require("../../utils/jwt.utils");
const getCurrentUserId = (req) => {
    const { auth_token } = req.cookies;
    if (!auth_token) {
        return null;
    }
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
        return decoded?._id?.toString?.() || decoded?.id?.toString?.() || null;
    }
    catch {
        return null;
    }
};
const formatAdmin = (admin) => ({
    _id: admin._id,
    user: {
        _id: admin.user._id,
        username: admin.user.username,
        email: admin.user.email,
        role: admin.user.role,
    },
    permissions: admin.permissions,
    active: admin.active,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
});
const getPharmacyAdmins = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const admins = await admin_service_1.default.getAdminsByPharmacy(pharmacyId);
    res.json(admins.map(formatAdmin));
});
exports.getPharmacyAdmins = getPharmacyAdmins;
const addPharmacyUser = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const { username, email, password, role, permissions } = req.body;
    if (!username || !email || !password || !role) {
        res.status(400).json({ message: "username, email, password and role are required" });
        return;
    }
    const exists = await user_model_1.default.findOne({ email });
    if (exists) {
        res.status(400).json({ message: "User already exists" });
        return;
    }
    const currentUserId = getCurrentUserId(req);
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await user_model_1.default.create({ username, email, password: hashed, role, createdBy: currentUserId || undefined });
    const defaultPermissions = {
        manageOrders: true,
        manageMedicines: true,
        manageStocks: true,
        managePurchases: true,
        viewStatistics: true,
        manageUsers: false,
        manageSettings: false
    };
    const admin = await admin_service_1.default.create({
        user: user._id,
        pharmacies: [pharmacyId],
        permissions: permissions || defaultPermissions,
    });
    await (0, notification_service_1.notifyPharmacyAdmins)(pharmacyId, 'pharmacy-user-created', {
        title: 'Utilisateur ajoute',
        message: `${user.username} a ete ajoute a l'equipe.`,
        metadata: { userId: user._id?.toString(), role },
    });
    (0, notification_service_1.notifyUsers)([user._id?.toString()], 'pharmacy-user-created', {
        pharmacyId,
        title: 'Compte pharmacie cree',
        message: 'Votre compte pharmacie est pret.',
        metadata: { role },
    });
    res.status(201).json(formatAdmin({ ...admin.toObject(), user }));
});
exports.addPharmacyUser = addPharmacyUser;
const updatePharmacyUserRole = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const userId = req.params.userId;
    const currentUserId = getCurrentUserId(req);
    const { role } = req.body;
    if (!role) {
        res.status(400).json({ message: "role is required" });
        return;
    }
    if (!currentUserId) {
        res.status(401).json({ message: "Please logged!" });
        return;
    }
    const targetAdmin = await admin_service_1.default.getAdminByUserIdAndPharmacy(userId, pharmacyId);
    if (!targetAdmin) {
        res.status(404).json({ message: "User not found in this pharmacy" });
        return;
    }
    if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
        res.status(403).json({ message: "You cannot modify your own account role" });
        return;
    }
    const user = await user_model_1.default.findByIdAndUpdate(userId, { role }, { returnDocument: 'after' });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    (0, notification_service_1.notifyUsers)([user._id?.toString()], 'pharmacy-user-role-updated', {
        title: 'Role mis a jour',
        message: `Votre role est maintenant : ${role}.`,
        metadata: { role },
    });
    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    });
});
exports.updatePharmacyUserRole = updatePharmacyUserRole;
const removePharmacyUser = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const adminId = req.params.adminId;
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) {
        res.status(401).json({ message: "Please logged!" });
        return;
    }
    const targetAdmin = await admin_service_1.default.getAdminByIdAndPharmacy(adminId, pharmacyId);
    if (!targetAdmin) {
        res.status(404).json({ message: "Admin not found in this pharmacy" });
        return;
    }
    if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
        res.status(403).json({ message: "You cannot remove your own account" });
        return;
    }
    await admin_service_1.default.deleteAdminForPharmacyUser(pharmacyId, adminId);
    await (0, notification_service_1.notifyPharmacyAdmins)(pharmacyId, 'pharmacy-user-removed', {
        title: 'Utilisateur retire',
        message: "Un utilisateur a ete retire de l'equipe.",
        metadata: { adminId },
    });
    res.json({ message: 'User removed' });
});
exports.removePharmacyUser = removePharmacyUser;
const updatePharmacyAdminPermissions = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const adminId = req.params.adminId;
    const currentUserId = getCurrentUserId(req);
    const { permissions } = req.body;
    if (!permissions || typeof permissions !== 'object') {
        res.status(400).json({ message: "permissions is required" });
        return;
    }
    if (!currentUserId) {
        res.status(401).json({ message: "Please logged!" });
        return;
    }
    const targetAdmin = await admin_service_1.default.getAdminByIdAndPharmacy(adminId, pharmacyId);
    if (!targetAdmin) {
        res.status(404).json({ message: "Admin not found in this pharmacy" });
        return;
    }
    if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
        res.status(403).json({ message: "You cannot change your own permissions" });
        return;
    }
    const updated = await admin_service_1.default.updateAdminPermissions(adminId, permissions);
    if (!updated) {
        res.status(404).json({ message: "Admin not found" });
        return;
    }
    (0, notification_service_1.notifyUsers)([updated.user?._id?.toString?.() || updated.user?.toString?.()], 'pharmacy-permissions-updated', {
        title: 'Permissions mises a jour',
        message: 'Vos permissions pharmacie ont ete modifiees.',
        metadata: { permissions },
    });
    res.json(updated);
});
exports.updatePharmacyAdminPermissions = updatePharmacyAdminPermissions;
const togglePharmacyAdminActive = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const adminId = req.params.adminId;
    const currentUserId = getCurrentUserId(req);
    const { active } = req.body;
    if (typeof active !== 'boolean') {
        res.status(400).json({ message: "active boolean is required" });
        return;
    }
    if (!currentUserId) {
        res.status(401).json({ message: "Please logged!" });
        return;
    }
    const targetAdmin = await admin_service_1.default.getAdminByIdAndPharmacy(adminId, pharmacyId);
    if (!targetAdmin) {
        res.status(404).json({ message: "Admin not found in this pharmacy" });
        return;
    }
    if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
        res.status(403).json({ message: "You cannot change your own account status" });
        return;
    }
    const updated = await admin_service_1.default.toggleAdminActive(adminId, active);
    if (!updated) {
        res.status(404).json({ message: "Admin not found" });
        return;
    }
    (0, notification_service_1.notifyUsers)([updated.user?._id?.toString?.() || updated.user?.toString?.()], 'pharmacy-user-status-updated', {
        title: active ? 'Compte active' : 'Compte desactive',
        message: active ? 'Votre acces pharmacie est actif.' : 'Votre acces pharmacie a ete desactive.',
        metadata: { active },
    });
    res.json(updated);
});
exports.togglePharmacyAdminActive = togglePharmacyAdminActive;
