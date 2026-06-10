"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPharmacyStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const order_service_1 = __importDefault(require("../../services/order.service"));
const medicine_service_1 = __importDefault(require("../../services/medicine.service"));
const stock_service_1 = __importDefault(require("../../services/stock.service"));
const getPharmacyStats = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    try {
        const [orders, medicines, stocks] = await Promise.all([
            order_service_1.default.getOrdersByPharmacy(pharmacyId),
            medicine_service_1.default.getMedicinesByPharmacy(pharmacyId),
            stock_service_1.default.getStocksByPharmacy(pharmacyId)
        ]);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const totalMedications = medicines.length;
        const lowStockCount = stocks.filter(s => s.quantity < s.minQuantity).length;
        // Calculate today's revenue (orders with status 'completed' and from today)
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const todayRevenue = orders
            .filter(o => o.status === 'completed' && o.createdAt && new Date(o.createdAt) >= todayStart)
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        res.json({
            totalOrders,
            pendingOrders,
            totalMedications,
            lowStockCount,
            todayRevenue
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});
exports.getPharmacyStats = getPharmacyStats;
