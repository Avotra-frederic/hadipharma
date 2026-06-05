import { model, Schema } from "mongoose";
import IAdmin from "../interface/admin.interface";

const adminSchema = new Schema<IAdmin>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pharmacies: [{
        type: Schema.Types.ObjectId,
        ref: "Pharmacy"
    }],
    permissions: {
        manageMedicines: { type: Boolean, default: true },
        manageStocks: { type: Boolean, default: true },
        manageOrders: { type: Boolean, default: true },
        managePurchases: { type: Boolean, default: true },
        viewStatistics: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

const Admin = model<IAdmin>("Admin", adminSchema);
export default Admin;