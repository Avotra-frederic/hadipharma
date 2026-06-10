"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    orderReference: {
        type: String,
        unique: true,
        index: true
    },
    pharmacy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true
    },
    user: {
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
            price: {
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
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'visa', 'paypal', 'mobile_money'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentReference: {
        type: String,
        default: ''
    },
    customerInfo: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        notes: { type: String, default: '' }
    },
    paymentDetails: {
        cardLast4: { type: String, default: '' },
        paypalEmail: { type: String, default: '' },
        mobileMoneyPhone: { type: String, default: '' }
    },
    prescription: {
        fileName: { type: String },
        filePath: { type: String },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        notes: { type: String, default: '' }
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
orderSchema.pre('save', function () {
    if (!this.orderReference) {
        this.orderReference = `CMD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }
});
const Order = (0, mongoose_1.model)("Order", orderSchema);
exports.default = Order;
