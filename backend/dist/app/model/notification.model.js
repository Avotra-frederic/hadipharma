"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pharmacy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Pharmacy' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
}, { timestamps: true });
notificationSchema.index({ user: 1, createdAt: -1 });
exports.default = (0, mongoose_1.model)('Notification', notificationSchema);
