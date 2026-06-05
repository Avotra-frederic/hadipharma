import { model, Schema } from "mongoose";
import { IPurchase } from "../interface/purchase.interface";

const purchaseSchema = new Schema<IPurchase>({
    pharmacy: {
        type: Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true
    },
    supplier: {
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

const Purchase = model<IPurchase>("Purchase", purchaseSchema);
export default Purchase;