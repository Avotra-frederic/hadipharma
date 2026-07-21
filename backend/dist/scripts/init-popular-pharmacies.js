"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const pharmacy_model_1 = __importDefault(require("../app/model/pharmacy.model"));
dotenv_1.default.config();
const initializePopularPharmacies = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hadipharma";
        await mongoose_1.default.connect(MONGO_URI);
        // Get all active and validated pharmacies, sorted by creation date
        const pharmacies = await pharmacy_model_1.default.find({
            isActive: true,
            isValidated: true
        })
            .sort({ createdAt: -1 })
            .limit(10);
        console.log(`Found ${pharmacies.length} active and validated pharmacies`);
        if (pharmacies.length === 0) {
            console.log("No pharmacies to mark as popular");
            await mongoose_1.default.disconnect();
            process.exit(0);
        }
        // Mark first 10 as popular
        const pharmacyIds = pharmacies.map(p => p._id);
        await pharmacy_model_1.default.updateMany({ _id: { $in: pharmacyIds } }, { isPopular: true });
        // Unmark others as not popular
        await pharmacy_model_1.default.updateMany({ _id: { $nin: pharmacyIds } }, { isPopular: false });
        console.log(`Successfully marked ${pharmacies.length} pharmacies as popular:`);
        pharmacies.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} (ID: ${p._id})`);
        });
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};
initializePopularPharmacies();
