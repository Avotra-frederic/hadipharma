"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateStock = exports.updateStock = exports.getLowStock = exports.getStocks = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const stock_service_1 = __importDefault(require("../../services/stock.service"));
const getStocks = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const stocks = await stock_service_1.default.getStocksByPharmacy(pharmacyId);
    // Map to include medicationName from populated medication
    const formattedStocks = stocks.map(stock => ({
        _id: stock._id,
        medicationId: stock.medication,
        medicationName: stock.medication?.name || 'Unknown',
        pharmacyId: stock.pharmacy,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        updatedAt: stock.updatedAt
    }));
    res.json(formattedStocks);
});
exports.getStocks = getStocks;
const getLowStock = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const stocks = await stock_service_1.default.getLowStockByPharmacy(pharmacyId);
    const formattedStocks = stocks.map(stock => ({
        _id: stock._id,
        medicationId: stock.medication,
        medicationName: stock.medication?.name || 'Unknown',
        pharmacyId: stock.pharmacy,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        updatedAt: stock.updatedAt
    }));
    res.json(formattedStocks);
});
exports.getLowStock = getLowStock;
const updateStock = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const medicationId = req.params.medicationId;
    const { quantity } = req.body;
    // Update stock
    await stock_service_1.default.updateStock(pharmacyId, medicationId, quantity);
    // Fetch updated stock with populated medication
    const stock = await stock_service_1.default.getStockByMedication(pharmacyId, medicationId);
    if (!stock) {
        res.status(404).json({ message: "Stock not found" });
        return;
    }
    res.json({
        _id: stock._id,
        medicationId: stock.medication,
        medicationName: stock.medication?.name || 'Unknown',
        pharmacyId: stock.pharmacy,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        updatedAt: stock.updatedAt
    });
});
exports.updateStock = updateStock;
const createOrUpdateStock = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const medicationId = req.params.medicationId;
    const { quantity, minQuantity } = req.body;
    const stock = await stock_service_1.default.createOrUpdateStock(pharmacyId, medicationId, quantity, minQuantity);
    // Fetch with population
    const updatedStock = await stock_service_1.default.getStockByMedication(pharmacyId, medicationId);
    if (!updatedStock) {
        res.status(404).json({ message: "Stock not found" });
        return;
    }
    res.json({
        _id: updatedStock._id,
        medicationId: updatedStock.medication,
        medicationName: updatedStock.medication?.name || 'Unknown',
        pharmacyId: updatedStock.pharmacy,
        quantity: updatedStock.quantity,
        minQuantity: updatedStock.minQuantity,
        updatedAt: updatedStock.updatedAt
    });
});
exports.createOrUpdateStock = createOrUpdateStock;
