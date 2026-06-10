import Purchase from "../app/model/purchase.model";
import { IPurchase } from "../app/interface/purchase.interface";
import Stock from "../app/model/stock.model";

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
        const purchase = await Purchase.findByIdAndUpdate(purchaseId as any, { status }, { returnDocument: 'after' });

        if (purchase && status === 'received') {
            await this.increaseStock(purchase);
        }

        return purchase;
    }

    private async increaseStock(purchase: any): Promise<void> {
        if (!purchase.medicines || !purchase.pharmacy) return;
        for (const med of purchase.medicines) {
            const medicineId = typeof med.medicine === 'object' ? (med.medicine as any)?._id : med.medicine;
            if (!medicineId) continue;
            const stock = await Stock.findOne({ pharmacy: purchase.pharmacy, medication: medicineId as any });
            if (!stock) {
                await Stock.create({
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

export default new PurchaseService();