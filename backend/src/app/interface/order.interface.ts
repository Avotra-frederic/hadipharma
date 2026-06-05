import { Schema } from "mongoose";

export interface IOrder {
    _id?: Schema.Types.ObjectId;
    pharmacy: Schema.Types.ObjectId; // Reference to Pharmacy
    user: Schema.Types.ObjectId; // Reference to User (customer)
    medicines: Array<{
        medicine: Schema.Types.ObjectId; // Reference to Medicine
        quantity: number;
        price: number; // price at time of order
    }>;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    paymentMethod: 'cash' | 'visa' | 'paypal';
    orderDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}