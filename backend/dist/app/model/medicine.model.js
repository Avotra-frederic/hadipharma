"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const medicineSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    photo: {
        type: String
    },
    pharmacy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true
    }
}, {
    timestamps: true
});
medicineSchema.index({ name: "text", category: "text" });
const Medicine = (0, mongoose_1.model)("Medicine", medicineSchema);
exports.default = Medicine;
