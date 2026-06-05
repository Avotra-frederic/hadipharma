import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { IMedicine } from "../../app/interface/medicine.interface";
import medicineService from "../../services/medicine.service";
import stockService from "../../services/stock.service";
import { uploadSingle } from "../../core/features/multer.config";

const getMedicinesByPharmacy = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const medicines = await medicineService.getMedicinesByPharmacy(pharmacyId);
    res.json(medicines);
});

const createMedicine = [
    uploadSingle,
    expressAsyncHandler(async (req: Request, res: Response) => {
        const pharmacyId = req.params.pharmacyId as string;
        const allMedicineData = JSON.parse(req.body.data || '{}') as Partial<IMedicine> & {
            quantity?: number;
            minQuantity?: number;
        };
        const { quantity, minQuantity, ...medicineData } = allMedicineData;
        const medicine = await medicineService.createMedicine({
            ...medicineData,
            pharmacy: pharmacyId as any,
            photo: req.file ? `/uploads/${req.file.filename}` : undefined
        } as IMedicine);
        const medicationId = medicine._id?.toString();
        if (quantity !== undefined && minQuantity !== undefined && medicationId) {
            await stockService.createOrUpdateStock(pharmacyId, medicationId, quantity, minQuantity);
        }
        res.status(201).json(medicine);
    })
];

const updateMedicine = [
    uploadSingle,
    expressAsyncHandler(async (req: Request, res: Response) => {
        const pharmacyId = req.params.pharmacyId as string;
        const medicineId = req.params.medicineId as string;
        const allMedicineData = JSON.parse(req.body.data || '{}') as Partial<IMedicine> & {
            quantity?: number;
            minQuantity?: number;
        };
        const { quantity, minQuantity, ...medicineData } = allMedicineData;
        const updateData: Partial<IMedicine> = { ...medicineData };
        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }
        const medicine = await medicineService.updateMedicine(medicineId, updateData);
        if (!medicine) {
            res.status(404).json({ message: "Medicine not found" });
            return;
        }
        if (quantity !== undefined && minQuantity !== undefined) {
            await stockService.createOrUpdateStock(pharmacyId, medicineId, quantity, minQuantity);
        }
        res.json(medicine);
    })
];

const deleteMedicine = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const medicineId = req.params.medicineId as string;
    const deleted = await medicineService.deleteMedicine(medicineId);
    if (!deleted) {
        res.status(404).json({ message: "Medicine not found" });
        return;
    }
    res.status(204).send();
});

export { getMedicinesByPharmacy, createMedicine, updateMedicine, deleteMedicine };