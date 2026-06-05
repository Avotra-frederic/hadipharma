"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const purchaseSchema = new mongoose_1.Schema({
    pharmacy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true
    },
    supplier: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    medicines: [{
            medicine: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Medicine",
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
            }
        }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'received', 'cancelled'],
        default: 'pending'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const Purchase = (0, mongoose_1.model)("Purchase", purchaseSchema);
exports.default = Purchase;
