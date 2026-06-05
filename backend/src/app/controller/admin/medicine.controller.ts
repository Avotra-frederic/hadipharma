import Medicine from "../../../app/model/medicine.model";
import { IMedicine } from "../../../app/interface/medicine.interface";

class MedicineController {
    async createMedicine(data: IMedicine): Promise<IMedicine> {
        return Medicine.create(data);
    }

    async getMedicinesByPharmacy(pharmacyId: string): Promise<IMedicine[]> {
        return Medicine.find({ pharmacy: pharmacyId as any });
    }

    async getMedicineById(id: string): Promise<IMedicine | null> {
        return Medicine.findById(id);
    }

    async updateMedicine(id: string, data: Partial<IMedicine>): Promise<IMedicine | null> {
        return Medicine.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    }

    async deleteMedicine(id: string): Promise<boolean> {
        const medicine = await Medicine.findByIdAndDelete(id);
        return medicine !== null;
    }
}

export default new MedicineController();