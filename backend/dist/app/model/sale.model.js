"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const saleSchema = new mongoose_1.Schema({
    medicine: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true
    },
    pharmacy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    customerName: {
        type: String,
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    saleDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const Sale = (0, mongoose_1.model)("Sale", saleSchema);
exports.default = Sale;
