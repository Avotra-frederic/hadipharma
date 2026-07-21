"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pharmacyAdminOnly = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jwt_utils_1 = require("../../utils/jwt.utils");
const admin_service_1 = __importDefault(require("../../services/admin.service"));
const pharmacy_model_1 = __importDefault(require("../../app/model/pharmacy.model"));
const pharmacyAdminOnly = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { auth_token } = req.cookies;
    if (!auth_token) {
        res.status(401).json({ message: "Please logged!" });
        return;
    }
    let decoded;
    try {
        decoded = (0, jwt_utils_1.verifyToken)(auth_token);
    }
    catch (error) {
        res.status(401).json({ message: "Token invalid!" });
        return;
    }
    const pharmacyIdParam = req.params.pharmacyId;
    const pharmacyId = Array.isArray(pharmacyIdParam) ? pharmacyIdParam[0] : pharmacyIdParam;
    if (!pharmacyId) {
        res.status(400).json({ message: "Missing pharmacyId parameter" });
        return;
    }
    const isAdmin = await admin_service_1.default.isUserAdminForPharmacy(decoded._id, pharmacyId);
    if (!isAdmin) {
        res.status(403).json({ message: "Access denied: Pharmacy admin privileges required" });
        return;
    }
    const pharmacy = await pharmacy_model_1.default.findById(pharmacyId);
    if (!pharmacy) {
        res.status(404).json({ message: "Pharmacy not found" });
        return;
    }
    if (!pharmacy.isActive) {
        res.status(403).json({ message: "Cette pharmacie est désactivée. Veuillez contacter le support." });
        return;
    }
    if (pharmacy.subscriptionEndDate && new Date() > new Date(pharmacy.subscriptionEndDate)) {
        res.status(403).json({ message: "Votre abonnement a expiré. Veuillez renouveler votre abonnement pour accéder au panneau d'administration." });
        return;
    }
    next();
});
exports.pharmacyAdminOnly = pharmacyAdminOnly;
