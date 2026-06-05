"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pharmacies: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Pharmacy"
        }],
    permissions: {
        manageMedicines: { type: Boolean, default: true },
        manageStocks: { type: Boolean, default: true },
        manageOrders: { type: Boolean, default: true },
        managePurchases: { type: Boolean, default: true },
        viewStatistics: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});
const Admin = (0, mongoose_1.model)("Admin", adminSchema);
exports.default = Admin;
