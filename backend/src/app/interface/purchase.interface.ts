import { Schema } from "mongoose";

export interface IPurchase {
    _id?: Schema.Types.ObjectId;
    pharmacy: Schema.Types.ObjectId; // Reference to Pharmacy
    supplier: Schema.Types.ObjectId; // Reference to User (supplier) or could be a separate Supplier model, but for simplicity we use User
    medicines: Array<{
        medicine: Schema.Types.ObjectId; // Reference to Medicine
        quantity: number;
        unitPrice: number; // price per unit at time of purchase
    }>;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'received' | 'cancelled';
    purchaseDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}