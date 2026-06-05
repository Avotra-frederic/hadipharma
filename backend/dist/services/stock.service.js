"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stock_model_1 = __importDefault(require("../app/model/stock.model"));
class StockService {
    async getStocksByPharmacy(pharmacyId) {
        return stock_model_1.default.find({ pharmacy: pharmacyId }).populate('medication', 'name category');
    }
    async getStockByMedication(pharmacyId, medicationId) {
        return stock_model_1.default.findOne({ pharmacy: pharmacyId, medication: medicationId });
    }
    async updateStock(pharmacyId, medicationId, quantity) {
        return stock_model_1.default.findOneAndUpdate({ pharmacy: pharmacyId, medication: medicationId }, { quantity }, { returnDocument: 'after' });
    }
    async createOrUpdateStock(pharmacyId, medicationId, quantity, minQuantity) {
        const stock = await stock_model_1.default.findOneAndUpdate({ pharmacy: pharmacyId, medication: medicationId }, { quantity, minQuantity }, { returnDocument: 'after', upsert: true });
        return stock;
    }
}
exports.default = new StockService();
