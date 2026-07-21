import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { IMedicine } from "../../app/interface/medicine.interface";
import medicineService from "../../services/medicine.service";
import stockService from "../../services/stock.service";
import { uploadSingle } from "../../core/features/multer.config";
import { notifyPharmacyAdmins } from "../../services/notification.service";

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
        await notifyPharmacyAdmins(pharmacyId, 'medicine-created', {
            title: 'Medicament ajoute',
            message: `${medicine.name || 'Un medicament'} a ete ajoute au catalogue.`,
            metadata: { medicineId: medicationId },
        });
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
        await notifyPharmacyAdmins(pharmacyId, 'medicine-updated', {
            title: 'Medicament modifie',
            message: `${medicine.name || 'Un medicament'} a ete mis a jour.`,
            metadata: { medicineId },
        });
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
    await notifyPharmacyAdmins(pharmacyId, 'medicine-deleted', {
        title: 'Medicament supprime',
        message: 'Un medicament a ete retire du catalogue.',
        metadata: { medicineId },
    });
    res.status(204).send();
});

export { getMedicinesByPharmacy, createMedicine, updateMedicine, deleteMedicine };
