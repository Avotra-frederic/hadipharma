"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userShema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["client", "pharmacist", "admin", "superadmin"],
        default: "client"
    },
    photo: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    paymentMethods: [{
            type: {
                type: String,
                enum: ['visa', 'paypal', 'mobile_money', 'cash'],
                required: true
            },
            last4: String,
            holder: String,
            expiry: String,
            phone: String,
            email: String,
            isDefault: {
                type: Boolean,
                default: false
            }
        }]
}, {
    timestamps: true
});
const User = (0, mongoose_1.model)("User", userShema);
exports.default = User;
