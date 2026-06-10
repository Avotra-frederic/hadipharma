import { model, Schema } from "mongoose";
import { IOrder } from "../interface/order.interface";

const orderSchema = new Schema<IOrder>({
    orderReference: {
        type: String,
        unique: true,
        index: true
    },
    pharmacy: {
        type: Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    medicines: [{
        medicine: {
            type: Schema.Types.ObjectId,
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

orderSchema.pre('save', function() {
    if (!this.orderReference) {
        this.orderReference = `CMD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }
});

const Order = model<IOrder>("Order", orderSchema);
export default Order;
