"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const purchase_model_1 = __importDefault(require("../app/model/purchase.model"));
class PurchaseService {
    async getPurchasesByPharmacy(pharmacyId) {
        return purchase_model_1.default.find({ pharmacy: pharmacyId }).populate('supplier', 'username phone').populate('medicines.medicine', 'name category');
    }
    async getPurchaseById(pharmacyId, purchaseId) {
        return purchase_model_1.default.findOne({ _id: purchaseId, pharmacy: pharmacyId }).populate('supplier', 'username phone');
    }
    async createPurchase(data) {
        return purchase_model_1.default.create(data);
    }
    async updatePurchaseStatus(purchaseId, status) {
        return purchase_model_1.default.findByIdAndUpdate(purchaseId, { status }, { returnDocument: 'after' });
    }
}
exports.default = new PurchaseService();
