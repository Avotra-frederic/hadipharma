import Stock from "../app/model/stock.model";
import { IStock } from "../app/interface/stock.interface";

class StockService {
    async getStocksByPharmacy(pharmacyId: string): Promise<IStock[]> {
        return Stock.find({ pharmacy: pharmacyId as any }).populate('medication', 'name category');
    }

    async getStockByMedication(pharmacyId: string, medicationId: string): Promise<IStock | null> {
        return Stock.findOne({ pharmacy: pharmacyId as any, medication: medicationId as any });
    }

    async updateStock(pharmacyId: string, medicationId: string, quantity: number): Promise<any> {
        return Stock.findOneAndUpdate(
            { pharmacy: pharmacyId as any, medication: medicationId as any },
            { quantity },
            { returnDocument: 'after' }
        );
    }

    async createOrUpdateStock(pharmacyId: string, medicationId: string, quantity: number, minQuantity: number): Promise<any> {
        const stock = await Stock.findOneAndUpdate(
            { pharmacy: pharmacyId as any, medication: medicationId as any },
            { quantity, minQuantity },
            { returnDocument: 'after', upsert: true }
        );
        return stock;
    }

    async getLowStockByPharmacy(pharmacyId: string): Promise<any[]> {
        return Stock.find({ pharmacy: pharmacyId as any, quantity: { $lt: 10 } }).populate('medication', 'name category').lean();
    }
}

export default new StockService();