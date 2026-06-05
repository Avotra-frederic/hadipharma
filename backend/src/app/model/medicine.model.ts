import { model, Schema } from "mongoose";
import { IMedicine } from "../interface/medicine.interface";

const medicineSchema = new Schema<IMedicine>({
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
        type: Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true
    }
}, {
    timestamps: true
});

medicineSchema.index({name: "text", category: "text"});

const Medicine = model<IMedicine>("Medicine", medicineSchema);
export default Medicine;