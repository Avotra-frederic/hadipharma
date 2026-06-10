import { Schema } from "mongoose";

export type PaymentMethod = 'cash' | 'visa' | 'paypal' | 'mobile_money';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface IOrder {
    _id?: Schema.Types.ObjectId;
    orderReference?: string;
    pharmacy: Schema.Types.ObjectId; // Reference to Pharmacy
    user: Schema.Types.ObjectId; // Reference to User (customer)
    medicines: Array<{
        medicine: Schema.Types.ObjectId; // Reference to Medicine
        quantity: number;
        price: number; // price at time of order
    }>;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    paymentReference?: string;
    customerInfo?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        notes?: string;
    };
    paymentDetails?: {
        cardLast4?: string;
        paypalEmail?: string;
        mobileMoneyPhone?: string;
    };
    prescription?: {
        fileName?: string;
        filePath?: string;
        status?: 'pending' | 'approved' | 'rejected';
        notes?: string;
    };
    orderDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
