import { Schema } from "mongoose";

export interface IMedicine {
    _id?: Schema.Types.ObjectId;
    name: string;
    description?: string;
    category: string;
    requiresPrescription: boolean;
    price: number;
    active?: boolean;
    photo?: string;
    pharmacy: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}