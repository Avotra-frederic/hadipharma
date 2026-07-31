"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subscriptionHistorySchema = new mongoose_1.Schema({
    pharmacy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    status: { type: String, enum: ['requested', 'active', 'expired', 'rejected'], required: true },
    startDate: Date,
    endDate: Date,
    features: { type: [String], default: [] },
    requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    note: String,
}, { timestamps: true });
subscriptionHistorySchema.index({ pharmacy: 1, createdAt: -1 });
exports.default = (0, mongoose_1.model)('SubscriptionHistory', subscriptionHistorySchema);
