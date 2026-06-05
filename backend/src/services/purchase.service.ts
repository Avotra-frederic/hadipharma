import Purchase from "../app/model/purchase.model";
import { IPurchase } from "../app/interface/purchase.interface";

class PurchaseService {
    async getPurchasesByPharmacy(pharmacyId: string): Promise<IPurchase[]> {
        return Purchase.find({ pharmacy: pharmacyId as any }).populate('supplier', 'username phone').populate('medicines.medicine', 'name category');
    }

    async getPurchaseById(pharmacyId: string, purchaseId: string): Promise<any> {
        return Purchase.findOne({ _id: purchaseId as any, pharmacy: pharmacyId as any }).populate('supplier', 'username phone');
    }

    async createPurchase(data: IPurchase): Promise<IPurchase> {
        return Purchase.create(data);
    }

    async updatePurchaseStatus(purchaseId: string, status: IPurchase['status']): Promise<any> {
        return Purchase.findByIdAndUpdate(purchaseId as any, { status }, { returnDocument: 'after' });
    }
}

export default new PurchaseService();