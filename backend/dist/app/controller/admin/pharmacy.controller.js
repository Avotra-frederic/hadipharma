"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePharmacySubscription = exports.getPharmacyDetails = exports.getAllPharmacies = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const admin_service_1 = __importDefault(require("../../../services/admin.service"));
const notification_service_1 = require("../../../services/notification.service");
const getCurrentAdminPharmacy = async (userId) => {
    const admin = await admin_service_1.default.getActiveAdminByUserId(userId);
    const pharmacy = admin?.pharmacies?.[0];
    return pharmacy || null;
};
const getAllPharmacies = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const pharmacy = await getCurrentAdminPharmacy(req.user._id);
        res.status(200).json({ pharmacies: pharmacy ? [pharmacy] : [] });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getAllPharmacies = getAllPharmacies;
const getPharmacyDetails = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const pharmacy = await getCurrentAdminPharmacy(req.user._id);
        if (!pharmacy || pharmacy._id.toString() !== id) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        res.status(200).json({ pharmacy });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getPharmacyDetails = getPharmacyDetails;
const updatePharmacySubscription = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status, endDate, features } = req.body;
    try {
        const pharmacy = await getCurrentAdminPharmacy(req.user._id);
        if (!pharmacy || pharmacy._id.toString() !== id) {
            res.status(403).json({ message: "Vous ne pouvez gérer que votre pharmacie." });
            return;
        }
        // Admins cannot directly activate subscriptions. Create a subscription request
        // that must be validated by the super administrator.
        // Attach the requesting admin's id if available in the request (req.user likely set by middleware).
        const requesterId = req.user._id;
        const result = await (await Promise.resolve().then(() => __importStar(require("../../../services/pharmacy.service")))).default.requestSubscription(id, { features, requestedBy: requesterId, endDate });
        await (0, notification_service_1.notifySuperAdmins)('subscription-requested', {
            pharmacyId: id,
            title: 'Demande de renouvellement',
            message: `La pharmacie "${pharmacy.name}" demande le renouvellement de son abonnement.`,
        });
        res.status(200).json({ message: "Subscription request submitted. Pending superadmin validation.", pharmacy: result });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updatePharmacySubscription = updatePharmacySubscription;
