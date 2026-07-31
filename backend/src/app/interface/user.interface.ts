import { Document } from "mongoose";

type UserRole = "client" | "pharmacist" | "admin" | "superadmin";

interface IUser extends Document {
    username: string,
    email: string,
    password: string,
    role: UserRole,
    photo?: string | null,
    isActive?: boolean,
    paymentMethods?: Array<{
        type: 'visa' | 'paypal' | 'mobile_money' | 'cash',
        last4?: string,
        holder?: string,
        expiry?: string,
        phone?: string,
        email?: string,
        isDefault?: boolean
    }>,
    favoriteMedicines?: any[],
    deliveryAddresses?: Array<{ title: string; address: string; city?: string; phone?: string; isDefault?: boolean }>
}

export default IUser;
