"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superadmin_middleware_1 = require("../app/middleware/superadmin.middleware");
const pharmacy_service_1 = __importDefault(require("../services/pharmacy.service"));
const admin_service_1 = __importDefault(require("../services/admin.service"));
const order_model_1 = __importDefault(require("../app/model/order.model"));
const user_model_1 = __importDefault(require("../app/model/user.model"));
const superAdminRouter = (0, express_1.Router)();
superAdminRouter.use(superadmin_middleware_1.superAdminOnly);
superAdminRouter.get("/stats", async (req, res) => {
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
        const pendingSubscriptions = (pharmacies || []).filter((p) => !p.subscriptionEndDate || new Date(p.subscriptionEndDate) < new Date()).length;
        const monthlySubscriptionRevenue = (pharmacies || []).filter((p) => p.subscriptionEndDate && new Date(p.subscriptionEndDate) >= new Date()).length * 50000;
        res.json({
            totalPharmacies: pharmacies?.length || 0,
            totalAdmins: admins?.length || 0,
            totalOrders,
            totalRevenue,
            todayOrders,
            todayRevenue,
            pendingSubscriptions,
            monthlySubscriptionRevenue,
            pharmacies: (pharmacies || []).map((p) => ({
                _id: p._id?.toString?.(),
                name: p.name,
                isActive: p.isActive,
                subscriptionEndDate: p.subscriptionEndDate,
                features: p.features || [],
                address: p.address,
                phone: p.phone,
            })),
            users: (admins || []).map((a) => ({
                _id: a._id?.toString?.(),
                username: a.user?.username || '',
                email: a.user?.email || '',
                role: a.user?.role || 'admin',
                pharmacies: a.pharmacies || [],
                active: a.active,
                createdAt: a.createdAt,
            })),
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.get("/pharmacies", async (req, res) => {
    try {
        const pharmacies = await pharmacy_service_1.default.findPharmacy();
        res.json({ pharmacies: pharmacies || [] });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.get("/pharmacies/:id", async (req, res) => {
    try {
        const pharmacy = await pharmacy_service_1.default.find(req.params.id);
        if (!pharmacy) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        res.json(pharmacy);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.put("/pharmacies/:id/toggle", async (req, res) => {
    try {
        const pharmacy = await pharmacy_service_1.default.find(req.params.id);
        if (!pharmacy) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        const updated = await pharmacy_service_1.default.update(req.params.id, {
            isActive: !pharmacy.isActive,
        });
        res.json({ message: `Pharmacy ${updated?.isActive ? 'activated' : 'deactivated'}`, pharmacy: updated });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.put("/pharmacies/:id/subscription", async (req, res) => {
    try {
        const { endDate, features } = req.body;
        const updated = await pharmacy_service_1.default.update(req.params.id, {
            subscriptionEndDate: endDate ? new Date(endDate) : undefined,
            features: features || [],
            isActive: true,
        });
        res.json({ message: "Subscription updated", pharmacy: updated });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.get("/users", async (req, res) => {
    try {
        const users = await user_model_1.default.find({});
        const admins = await admin_service_1.default.getAllAdmins();
        res.json({
            users: users.map((u) => ({
                _id: u._id?.toString?.(),
                username: u.username,
                email: u.email,
                role: u.role,
                isActive: u.isActive,
            })),
            admins: admins.map((a) => ({
                _id: a._id?.toString?.(),
                username: a.user?.username,
                email: a.user?.email,
                role: a.user?.role,
                pharmacies: a.pharmacies,
                active: a.active,
            })),
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.put("/users/:userId/role", async (req, res) => {
    try {
        const { role } = req.body;
        const user = await user_model_1.default.findByIdAndUpdate(req.params.userId, { role }, { new: true });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ message: "Role updated", user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.put("/users/:userId/toggle", async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.params.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const updated = await user_model_1.default.findByIdAndUpdate(req.params.userId, { isActive: !user.isActive }, { new: true });
        res.json({ message: `User ${updated?.isActive ? 'activated' : 'deactivated'}`, user: updated });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
superAdminRouter.delete("/users/:userId", async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.params.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        await user_model_1.default.findByIdAndDelete(req.params.userId);
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = superAdminRouter;
