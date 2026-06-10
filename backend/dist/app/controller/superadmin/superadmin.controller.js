"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuperAdminStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const pharmacy_service_1 = __importDefault(require("../../../services/pharmacy.service"));
const admin_service_1 = __importDefault(require("../../../services/admin.service"));
const order_model_1 = __importDefault(require("../../../app/model/order.model"));
const getSuperAdminStats = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const pharmacies = await pharmacy_service_1.default.findPharmacy();
        const admins = await admin_service_1.default.getAllAdmins();
        const totalOrders = await order_model_1.default.countDocuments();
        const totalRevenueAgg = await order_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayOrders = await order_model_1.default.countDocuments({ createdAt: { $gte: startOfDay } });
        const todayRevenueAgg = await order_model_1.default.aggregate([
            { $match: { createdAt: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const todayRevenue = todayRevenueAgg[0]?.total || 0;
        res.json({
            totalPharmacies: pharmacies?.length || 0,
            totalAdmins: admins?.length || 0,
            totalOrders,
            totalRevenue,
            todayOrders,
            todayRevenue,
            pendingSubscriptions: (pharmacies || []).filter((p) => !p.subscriptionEndDate || new Date(p.subscriptionEndDate) < new Date()).length,
            monthlySubscriptionRevenue: (pharmacies || []).filter((p) => p.subscriptionEndDate && new Date(p.subscriptionEndDate) >= new Date()).length * 50000,
            pharmacies: (pharmacies || []).map((p) => ({
                _id: p._id?.toString?.(),
                name: p.name,
                isActive: p.isActive,
                subscriptionEndDate: p.subscriptionEndDate,
                features: p.features || [],
                address: p.address,
                phone: p.phone,
            })),
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getSuperAdminStats = getSuperAdminStats;
