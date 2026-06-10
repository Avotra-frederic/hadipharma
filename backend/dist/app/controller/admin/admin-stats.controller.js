"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopMedicinesBySales = exports.getStockEvolution = exports.getSalesByYear = exports.getSalesByMonth = exports.getAdminStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const admin_service_1 = __importDefault(require("../../../services/admin.service"));
// GET /admin/stats
const getAdminStats = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const stats = await admin_service_1.default.getAdminStats();
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getAdminStats = getAdminStats;
// GET /admin/stats/sales-by-month?year=2024
const getSalesByMonth = (0, express_async_handler_1.default)(async (req, res) => {
    const { year } = req.query;
    if (!year) {
        res.status(400).json({ message: "Year is required" });
        return;
    }
    try {
        const stats = await admin_service_1.default.getSalesByMonth(parseInt(year));
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getSalesByMonth = getSalesByMonth;
// GET /admin/stats/sales-by-year
const getSalesByYear = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const stats = await admin_service_1.default.getSalesByYear();
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getSalesByYear = getSalesByYear;
// GET /admin/stats/stock-evolution?pharmacyId=xxx&period=monthly|yearly
const getStockEvolution = (0, express_async_handler_1.default)(async (req, res) => {
    const { pharmacyId, period } = req.query;
    if (!pharmacyId || !period) {
        res.status(400).json({ message: "pharmacyId and period are required" });
        return;
    }
    try {
        const stats = await admin_service_1.default.getStockEvolution(pharmacyId, period);
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getStockEvolution = getStockEvolution;
// GET /admin/stats/top-medicines?pharmacyId=xxx&period=monthly|yearly&limit=10
const getTopMedicinesBySales = (0, express_async_handler_1.default)(async (req, res) => {
    const { pharmacyId, period, limit = 10 } = req.query;
    if (!pharmacyId || !period) {
        res.status(400).json({ message: "pharmacyId and period are required" });
        return;
    }
    try {
        const stats = await admin_service_1.default.getTopMedicinesBySales(pharmacyId, period, parseInt(limit));
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getTopMedicinesBySales = getTopMedicinesBySales;
