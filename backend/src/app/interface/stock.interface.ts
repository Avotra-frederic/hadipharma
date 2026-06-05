import { Schema } from "mongoose";

export interface IStock {
    _id?: Schema.Types.ObjectId;
    medication: Schema.Types.ObjectId; // Reference to Medicine
    pharmacy: Schema.Types.ObjectId; // Reference to Pharmacy
    quantity: number;
    minQuantity: number;
    lastUpdated?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}