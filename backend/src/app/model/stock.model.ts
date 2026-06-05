import { model, Schema } from "mongoose";
import { IStock } from "../interface/stock.interface";

const stockSchema = new Schema<IStock>({
    medication: {
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
        min: 0
    },
    minQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Stock = model<IStock>("Stock", stockSchema);
export default Stock;