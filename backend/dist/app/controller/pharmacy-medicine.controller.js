"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedicine = exports.updateMedicine = exports.createMedicine = exports.getMedicinesByPharmacy = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const medicine_service_1 = __importDefault(require("../../services/medicine.service"));
const stock_service_1 = __importDefault(require("../../services/stock.service"));
const multer_config_1 = require("../../core/features/multer.config");
const getMedicinesByPharmacy = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const medicines = await medicine_service_1.default.getMedicinesByPharmacy(pharmacyId);
    res.json(medicines);
});
exports.getMedicinesByPharmacy = getMedicinesByPharmacy;
const createMedicine = [
    multer_config_1.uploadSingle,
    (0, express_async_handler_1.default)(async (req, res) => {
        const pharmacyId = req.params.pharmacyId;
        const allMedicineData = JSON.parse(req.body.data || '{}');
        const { quantity, minQuantity, ...medicineData } = allMedicineData;
        const medicine = await medicine_service_1.default.createMedicine({
            ...medicineData,
            pharmacy: pharmacyId,
            photo: req.file ? `/uploads/${req.file.filename}` : undefined
        });
        const medicationId = medicine._id?.toString();
        if (quantity !== undefined && minQuantity !== undefined && medicationId) {
            await stock_service_1.default.createOrUpdateStock(pharmacyId, medicationId, quantity, minQuantity);
        }
        res.status(201).json(medicine);
    })
];
exports.createMedicine = createMedicine;
const updateMedicine = [
    multer_config_1.uploadSingle,
    (0, express_async_handler_1.default)(async (req, res) => {
        const pharmacyId = req.params.pharmacyId;
        const medicineId = req.params.medicineId;
        const allMedicineData = JSON.parse(req.body.data || '{}');
        const { quantity, minQuantity, ...medicineData } = allMedicineData;
        const updateData = { ...medicineData };
        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }
        const medicine = await medicine_service_1.default.updateMedicine(medicineId, updateData);
        if (!medicine) {
            res.status(404).json({ message: "Medicine not found" });
            return;
        }
        if (quantity !== undefined && minQuantity !== undefined) {
            await stock_service_1.default.createOrUpdateStock(pharmacyId, medicineId, quantity, minQuantity);
        }
        res.json(medicine);
    })
];
exports.updateMedicine = updateMedicine;
const deleteMedicine = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const medicineId = req.params.medicineId;
    const deleted = await medicine_service_1.default.deleteMedicine(medicineId);
    if (!deleted) {
        res.status(404).json({ message: "Medicine not found" });
        return;
    }
    res.status(204).send();
});
exports.deleteMedicine = deleteMedicine;
