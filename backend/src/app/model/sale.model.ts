import { model, Schema } from "mongoose";
import { ISale } from "../interface/sale.interface";

const saleSchema = new Schema<ISale>({
    medicine: {
        type: Schema.Types.ObjectId,
        ref: "Medicine",
        required: true
    },
    pharmacy: {
        type: Schema.Types.ObjectId,
        ref: "Pharmacy",
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
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    customerName: {
        type: String,
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    saleDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Sale = model<ISale>("Sale", saleSchema);
export default Sale;