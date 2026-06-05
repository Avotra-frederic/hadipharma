"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const medicine_model_1 = __importDefault(require("../../../app/model/medicine.model"));
class MedicineController {
    async createMedicine(data) {
        return medicine_model_1.default.create(data);
    }
    async getMedicinesByPharmacy(pharmacyId) {
        return medicine_model_1.default.find({ pharmacy: pharmacyId });
    }
    async getMedicineById(id) {
        return medicine_model_1.default.findById(id);
    }
    async updateMedicine(id, data) {
        return medicine_model_1.default.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    }
    async deleteMedicine(id) {
        const medicine = await medicine_model_1.default.findByIdAndDelete(id);
        return medicine !== null;
    }
}
exports.default = new MedicineController();
