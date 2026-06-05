"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const stockSchema = new mongoose_1.Schema({
    medication: {
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
        min: 0
    },
    minQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const Stock = (0, mongoose_1.model)("Stock", stockSchema);
exports.default = Stock;
