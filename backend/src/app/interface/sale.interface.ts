import { Schema } from "mongoose";

export interface ISale {
    _id?: Schema.Types.ObjectId;
    medicine: Schema.Types.ObjectId; // Reference to Medicine
    pharmacy: Schema.Types.ObjectId; // Reference to Pharmacy
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customerName?: string;
    customerPhone?: string;
    saleDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}