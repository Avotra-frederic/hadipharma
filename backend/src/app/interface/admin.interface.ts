import { Document, Schema } from "mongoose";

export default interface IAdmin extends Document {
    user: Schema.Types.ObjectId;
    pharmacies: Array<Schema.Types.ObjectId>;
    permissions: {
        manageMedicines: boolean;
        manageStocks: boolean;
        manageOrders: boolean;
        managePurchases: boolean;
        viewStatistics: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
}