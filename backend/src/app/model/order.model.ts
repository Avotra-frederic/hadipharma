import { model, Schema } from "mongoose";
import { IOrder } from "../interface/order.interface";

const orderSchema = new Schema<IOrder>({
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
        enum: ['cash', 'visa', 'paypal'],
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Order = model<IOrder>("Order", orderSchema);
export default Order;