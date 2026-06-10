"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const purchase_model_1 = __importDefault(require("../app/model/purchase.model"));
const stock_model_1 = __importDefault(require("../app/model/stock.model"));
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
        const purchase = await purchase_model_1.default.findByIdAndUpdate(purchaseId, { status }, { returnDocument: 'after' });
        if (purchase && status === 'received') {
            await this.increaseStock(purchase);
        }
        return purchase;
    }
    async increaseStock(purchase) {
        if (!purchase.medicines || !purchase.pharmacy)
            return;
        for (const med of purchase.medicines) {
            const medicineId = typeof med.medicine === 'object' ? med.medicine?._id : med.medicine;
            if (!medicineId)
                continue;
            const stock = await stock_model_1.default.findOne({ pharmacy: purchase.pharmacy, medication: medicineId });
            if (!stock) {
                await stock_model_1.default.create({
                    pharmacy: purchase.pharmacy,
                    medication: medicineId,
                    quantity: med.quantity || 0,
                    minQuantity: 0,
                });
                continue;
            }
            stock.quantity = (stock.quantity || 0) + (med.quantity || 0);
            await stock.save();
        }
    }
}
exports.default = new PurchaseService();
