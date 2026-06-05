"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePharmacySubscription = exports.getPharmacyDetails = exports.getAllPharmacies = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const admin_service_1 = __importDefault(require("../../../services/admin.service"));
const getAllPharmacies = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const pharmacies = await admin_service_1.default.getAllPharmacies();
        res.status(200).json({ pharmacies });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getAllPharmacies = getAllPharmacies;
const getPharmacyDetails = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const pharmacy = await admin_service_1.default.getPharmacyDetails(id);
        if (!pharmacy) {
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
        const result = await admin_service_1.default.updatePharmacySubscription(id, { status, endDate, features });
        res.status(200).json({ message: "Subscription updated", pharmacy: result });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updatePharmacySubscription = updatePharmacySubscription;
